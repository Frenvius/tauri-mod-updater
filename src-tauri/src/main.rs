// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Window;
use tauri::Manager;
use std::io::Write;
use html_parser::Dom;
use sysinfo::{System};
use std::path::{Path};
use std::cell::RefCell;
use std::fs::{self, File};
use git2::build::{RepoBuilder};
use git2::{Direction, Repository};
use git2::{FetchOptions, Progress, RemoteCallbacks};

mod config;
mod utilities;

struct State {
	progress: Option<Progress<'static>>
}

fn main() {
	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![
      get_initial_data,
      run_game_windows,
      parse,
      sys_user_name,
      git_clone,
      git_pull,
      get_latest_hash,
      get_current_hash,
      config::get_config,
      config::set_config,
      config::config_folder,
      config::get_config_data,
      config::reset_config_file,
      utilities::set_log,
      utilities::uninstall,
      utilities::play_locked,
      utilities::play_text,
      utilities::git_progress,
      utilities::is_installed,
      utilities::needs_update,
      utilities::progress_type,
      utilities::status_text
    ])
		.setup(|app| {
			#[cfg(desktop)]
			app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
			Ok(())
		})
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_fs::init())
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}

#[tauri::command]
fn get_initial_data() -> Result<String, String> {
	let app_data_dir = dirs::data_dir().ok_or("Could not find AppData directory")?;
	let dir_path = app_data_dir.join("Valheim Mod Updater");
	let file_path = dir_path.join("mod_updater_data.json");

	match fs::create_dir_all(&dir_path) {
		Ok(_) => (),
		Err(e) => return Err(e.to_string()),
	}

	match fs::read_to_string(&file_path) {
		Ok(data) => Ok(data),
		Err(_) => {
			let default_data = "{}".to_string();
			match File::create(&file_path).and_then(|mut file| file.write_all(default_data.as_bytes())) {
				Ok(_) => Ok(default_data),
				Err(e) => Err(e.to_string()),
			}
		},
	}
}

fn get_steam_process_path() -> Option<String> {
	let mut system = System::new_all();
	system.refresh_all();

	for (_pid, process) in system.processes() {
		if process.name().to_lowercase() == "steam.exe" {
			return Some(process.exe()?.to_str().unwrap().to_string());
		}
	}

	None
}

#[cfg(target_os = "windows")]
#[tauri::command]
async fn run_game_windows() {
	let steam_path = get_steam_process_path().unwrap();
	let mods_path = dirs::data_dir().unwrap().join("Valheim Mod Updater");

	let child = std::process::Command::new(steam_path)
		.arg("-applaunch")
		.arg("892970")
		.arg("--doorstop-enable")
		.arg("true")
		.arg("--doorstop-target")
		.arg(format!("{}\\updater\\BepInEx\\core\\BepInEx.Preloader.dll", mods_path.display()))
		.spawn();

	match child {
		Ok(child) => {
			let _output = child.wait_with_output().expect("failed to wait on child");
		},
		Err(e) => {
			println!("Failed to start process: {}", e);
		}
	}
}

#[tauri::command]
async fn parse(value: &str) -> Result<String, Error> {
	let result = Dom::parse(value)?.to_json_pretty()?;
	Ok(result)
}

#[tauri::command]
async fn sys_user_name() -> Result<String, Error> {
	let user_name = whoami::username();
	Ok(user_name)
}

#[tauri::command]
async fn git_clone(url: String, path: String, window: Window) -> Result<String, Error> {
	let state = RefCell::new(State {
		progress: None
	});
	let mut cb = RemoteCallbacks::new();
	cb.transfer_progress(|stats| {
		let mut state = state.borrow_mut();
		state.progress = Some(stats.to_owned());
		if let Some(progress) = &state.progress {
			let percent = (progress.received_objects() as f32 / progress.total_objects() as f32) * 100.0;
			window.emit("git_clone_progress", percent as i32).unwrap();
		}
		true
	});

	let mut fo = FetchOptions::new();
	fo.depth(1);
	fo.remote_callbacks(cb);
	RepoBuilder::new()
		.fetch_options(fo)
		.clone(&url, Path::new(&path))?;
	println!();
	Ok("done".to_string())
}

#[tauri::command]
async fn git_pull(path: String, window: Window) -> Result<String, Error> {
	let state = RefCell::new(State {
		progress: None
	});
	let mut cb = RemoteCallbacks::new();
	cb.transfer_progress(|stats| {
		let mut state = state.borrow_mut();
		state.progress = Some(stats.to_owned());
		if let Some(progress) = &state.progress {
			let percent = (progress.received_objects() as f32 / progress.total_objects() as f32) * 100.0;
			window.emit("git_pull_progress", percent as i32).unwrap();
		}
		true
	});

	let mut fo = FetchOptions::new();
	fo.remote_callbacks(cb);
	let repo = Repository::open(path)?;
	let mut remote = repo.find_remote("origin")?;
	remote.fetch(&["master"], Some(&mut fo), None)?;
	let obj = repo.revparse_single("FETCH_HEAD")?;
	repo.reset(&obj, git2::ResetType::Hard, None)?;
	Ok("done".to_string())
}

#[tauri::command]
async fn get_latest_hash(path: String) -> Result<Option<String>, Error> {
	if !Path::new(&path).exists() || Path::new(&path).read_dir()?.next().is_none() {
		return Ok(None);
	}

	let repo = Repository::open(path)?;
	let mut remote = repo.find_remote("origin")?;
	let connection = remote.connect_auth(Direction::Fetch, None, None)?;
	let refs = connection.list()?;
	let mut branches = Vec::new();
	for r in refs {
		branches.push(r.oid().to_string());
	}

	Ok(Some(branches[0].to_string()))
}

#[tauri::command]
async fn get_current_hash(path: String) -> Result<Option<String>, Error> {
	if !Path::new(&path).exists() {
		return Ok(None);
	}

	let repo = Repository::open(path)?;
	let head = repo.head()?;
	let oid = head.target().unwrap();
	let commit = repo.find_commit(oid)?;
	Ok(Some(commit.id().to_string()))
}

#[derive(Debug, thiserror::Error)]
enum Error {
	#[error("IO error")]
	Io(#[from] std::io::Error),
	#[error("JSON error")]
	Json(#[from] serde_json::Error),
	#[error("HTML error")]
	Html(#[from] html_parser::Error),
	#[error("Git error")]
	Git(#[from] git2::Error),
}

impl serde::Serialize for Error {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
		where
			S: serde::ser::Serializer,
	{
		Ok(match self {
			Error::Io(e) => serializer.serialize_str(&format!("IO error: {}", e)),
			Error::Json(e) => serializer.serialize_str(&format!("JSON error: {}", e)),
			Error::Html(..) => serializer.serialize_str(&format!("HTML error: {}", self.to_string())),
			Error::Git(e) => serializer.serialize_str(&format!("Git error: {}", e)),
		}.expect("TODO: panic message"))
	}
}
