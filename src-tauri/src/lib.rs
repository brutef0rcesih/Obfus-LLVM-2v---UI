// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_config_templates(content: String) -> Result<(), String> {
    use std::fs;
    use std::env;
    
    println!("=== Save Config Templates Called ===");
    println!("Content length: {}", content.len());
    
    // Get current working directory
    let current_dir = env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    println!("Current directory: {:?}", current_dir);
    
    // Build list of possible data directories
    let mut possible_dirs = Vec::new();
    
    // Path 1: Relative to current directory (project root)
    possible_dirs.push(current_dir.join("src").join("data"));
    
    // Path 2: If we're in src-tauri, go up one level
    if let Some(parent) = current_dir.parent() {
        possible_dirs.push(parent.join("src").join("data"));
    }
    
    // Path 3: Relative to executable (production)
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            if let Some(project_root) = exe_dir.parent() {
                possible_dirs.push(project_root.join("src").join("data"));
            }
        }
    }
    
    // Try to find an existing data directory or use the first valid parent
    let mut data_dir = None;
    for (i, dir) in possible_dirs.iter().enumerate() {
        println!("Checking path {}: {:?}", i + 1, dir);
        if dir.exists() {
            println!("✓ Using existing directory: {:?}", dir);
            data_dir = Some(dir.clone());
            break;
        } else if dir.parent().map(|p| p.exists()).unwrap_or(false) {
            println!("✓ Parent exists, will create: {:?}", dir);
            data_dir = Some(dir.clone());
            break;
        }
    }
    
    let final_data_dir = data_dir.ok_or_else(|| {
        "Could not determine data directory location".to_string()
    })?;
    
    // Create directory if it doesn't exist
    if !final_data_dir.exists() {
        fs::create_dir_all(&final_data_dir)
            .map_err(|e| format!("Failed to create directory {:?}: {}", final_data_dir, e))?;
        println!("Created directory: {:?}", final_data_dir);
    }
    
    let file_path = final_data_dir.join("config-templates.json");
    println!("Writing to file: {:?}", file_path);
    
    fs::write(&file_path, &content)
        .map_err(|e| format!("Failed to write file at {:?}: {}", file_path, e))?;
    
    println!("✓ Successfully saved templates to: {:?}", file_path);
    Ok(())
}

#[tauri::command]
fn load_config_templates() -> Result<String, String> {
    use std::fs;
    use std::env;
    
    println!("=== Load Config Templates Called ===");
    
    // Get current working directory
    let current_dir = env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    println!("Current directory: {:?}", current_dir);
    
    // Build list of possible paths
    let mut possible_paths = Vec::new();
    
    // Path 1: Relative to current directory (project root)
    possible_paths.push(current_dir.join("src").join("data").join("config-templates.json"));
    
    // Path 2: If we're in src-tauri, go up one level
    if let Some(parent) = current_dir.parent() {
        possible_paths.push(parent.join("src").join("data").join("config-templates.json"));
    }
    
    // Path 3: Relative to executable (production)
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            if let Some(project_root) = exe_dir.parent() {
                possible_paths.push(project_root.join("src").join("data").join("config-templates.json"));
            }
        }
    }
    
    // Try each path
    for (i, path) in possible_paths.iter().enumerate() {
        println!("Path {}: Trying {:?}", i + 1, path);
        if path.exists() {
            println!("✓ Found config file at: {:?}", path);
            let content = fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read file at {:?}: {}", path, e))?;
            println!("Successfully loaded templates, content length: {}", content.len());
            return Ok(content);
        } else {
            println!("✗ File not found at: {:?}", path);
        }
    }
    
    // If no file found, return empty template structure
    println!("No config file found, returning empty templates");
    Ok(r#"{"templates":[]}"#.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, save_config_templates, load_config_templates])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
