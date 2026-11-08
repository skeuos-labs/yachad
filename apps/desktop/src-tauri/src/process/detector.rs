use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedAppPaths {
    pub propresenter: Option<String>,
    pub freeshow: Option<String>,
    pub videopsalm: Option<String>,
}

fn normalize_slash(p: &Path) -> String {
    p.to_string_lossy().replace('\\', "/")
}

fn home_dir() -> Option<PathBuf> {
    if let Ok(p) = std::env::var("USERPROFILE") {
        return Some(PathBuf::from(p));
    }
    if let Ok(p) = std::env::var("HOME") {
        return Some(PathBuf::from(p));
    }
    None
}

/// ProPresenter 7: Available on Windows and macOS
pub fn probe_propresenter() -> Option<String> {
    // 1. Windows: Inspect PathSettings.proPaths in AppData
    #[cfg(target_os = "windows")]
    {
        if let Ok(appdata) = std::env::var("APPDATA") {
            let settings_path = PathBuf::from(appdata)
                .join("RenewedVision")
                .join("ProPresenter")
                .join("PathSettings.proPaths");

            if settings_path.exists() {
                if let Ok(content) = fs::read_to_string(&settings_path) {
                    for line in content.lines() {
                        if let Some(pos) = line.find("\"Path\":\"") {
                            let sub = &line[pos + 8..];
                            if let Some(end_pos) = sub.find("\"") {
                                let raw_path = &sub[..end_pos];
                                let cleaned = raw_path.replace("\\\\", "/").replace('\\', "/");
                                let p = PathBuf::from(&cleaned).join("Libraries");
                                if p.exists() {
                                    return Some(normalize_slash(&p));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 2. macOS: ~/Library/Application Support/RenewedVision/ProPresenter/
    #[cfg(target_os = "macos")]
    {
        if let Some(home) = home_dir() {
            let mac_appdata = home
                .join("Library")
                .join("Application Support")
                .join("RenewedVision")
                .join("ProPresenter")
                .join("Libraries");
            if mac_appdata.exists() {
                return Some(normalize_slash(&mac_appdata));
            }
        }
    }

    // 3. Documents fallback (Windows & macOS: ~/Documents/ProPresenter/Libraries)
    if let Some(home) = home_dir() {
        let docs_path = home.join("Documents").join("ProPresenter").join("Libraries");
        if docs_path.exists() {
            return Some(normalize_slash(&docs_path));
        }
    }

    None
}

/// FreeShow: Available on Windows, macOS, and Linux
pub fn probe_freeshow() -> Option<String> {
    // 1. Read config.json for custom dataPath
    let config_locations = {
        let mut locs = Vec::new();
        if let Ok(appdata) = std::env::var("APPDATA") {
            locs.push(PathBuf::from(appdata).join("FreeShow").join("config.json"));
        }
        if let Some(home) = home_dir() {
            // macOS
            locs.push(
                home.join("Library")
                    .join("Application Support")
                    .join("FreeShow")
                    .join("config.json"),
            );
            // Linux (~/.config/FreeShow/config.json)
            locs.push(home.join(".config").join("FreeShow").join("config.json"));
        }
        locs
    };

    for config_path in config_locations {
        if config_path.exists() {
            if let Ok(content) = fs::read_to_string(&config_path) {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                    if let Some(data_path) = json.get("dataPath").and_then(|v| v.as_str()) {
                        let base = PathBuf::from(data_path);
                        let shows_cap = base.join("Shows");
                        if shows_cap.exists() {
                            return Some(normalize_slash(&shows_cap));
                        }
                        let shows_lower = base.join("shows");
                        if shows_lower.exists() {
                            return Some(normalize_slash(&shows_lower));
                        }
                    }
                }
            }
        }
    }

    // 2. Documents / Standard Shows directory fallback
    if let Some(home) = home_dir() {
        let docs_base = home.join("Documents").join("FreeShow");
        let shows_cap = docs_base.join("Shows");
        if shows_cap.exists() {
            return Some(normalize_slash(&shows_cap));
        }
        let shows_lower = docs_base.join("shows");
        if shows_lower.exists() {
            return Some(normalize_slash(&shows_lower));
        }

        // Linux ~/.local/share/FreeShow/shows fallback
        let linux_data = home.join(".local").join("share").join("FreeShow").join("shows");
        if linux_data.exists() {
            return Some(normalize_slash(&linux_data));
        }
    }

    None
}

/// VideoPsalm: Windows only
pub fn probe_videopsalm() -> Option<String> {
    // VideoPsalm is Windows-only; return None on macOS and Linux
    #[cfg(not(target_os = "windows"))]
    {
        return None;
    }

    #[cfg(target_os = "windows")]
    {
        // 1. Check Public Documents (Standard Windows VideoPsalm installer location)
        let public_path = PathBuf::from("C:\\Users\\Public\\Documents\\VideoPsalm\\SongBooks");
        if public_path.exists() {
            return Some(normalize_slash(&public_path));
        }
        let public_path_lower = PathBuf::from("C:\\Users\\Public\\Documents\\VideoPsalm\\Songbooks");
        if public_path_lower.exists() {
            return Some(normalize_slash(&public_path_lower));
        }

        // 2. Check UserProfile Documents
        if let Some(home) = home_dir() {
            let p = home.join("Documents").join("VideoPsalm").join("SongBooks");
            if p.exists() {
                return Some(normalize_slash(&p));
            }
            let p_lower = home.join("Documents").join("VideoPsalm").join("Songbooks");
            if p_lower.exists() {
                return Some(normalize_slash(&p_lower));
            }
        }

        None
    }
}

#[tauri::command]
pub fn detect_installed_libraries() -> DetectedAppPaths {
    DetectedAppPaths {
        propresenter: probe_propresenter(),
        freeshow: probe_freeshow(),
        videopsalm: probe_videopsalm(),
    }
}
