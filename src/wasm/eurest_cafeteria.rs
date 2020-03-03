use wasm_bindgen::prelude::*;
use std::error::Error;
use serde::Serialize;
use crate::utils::load_pdf;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct MenuContainer {
  montag: Menu,
  dienstag: Menu,
  mitwoch: Menu,
  donnerstag: Menu,
  freitag: Menu,
  menu_order: String,
  unknown: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Menu {
  tag: String,
  menus: [Vec<String>; 3],
  #[serde(skip_serializing_if = "Vec::is_empty")]
  extra: Vec<String>,
}

#[wasm_bindgen]
pub async fn parse_eurest_cafeteria_pdf(file_content: Vec<u8>) -> String {
  let content = load_pdf(file_content);

  let lines = content
    .lines()
    .into_iter()
    .filter(|l| !l.is_empty())
    .map(|l| {
      l.replace("   ", "$")
        .replace(" ", "")
        .replace("$", " ")
    })
    .collect::<Vec<String>>();

  let res = separate(lines).expect("Failed to separate text into struct");

  let json_result = serde_json::to_string(&res).expect("Failed to serialize struct");

  json_result
}

fn separate(lines: Vec<String>) -> Result<MenuContainer, Box<dyn Error>> {
  let mut res = MenuContainer {
    montag: Menu { tag: String::new(), menus: [vec![], vec![], vec![]], extra: vec![] },
    dienstag: Menu { tag: String::new(), menus: [vec![], vec![], vec![]], extra: vec![] },
    mitwoch: Menu { tag: String::new(), menus: [vec![], vec![], vec![]], extra: vec![] },
    donnerstag: Menu { tag: String::new(), menus: [vec![], vec![], vec![]], extra: vec![] },
    freitag: Menu { tag: String::new(), menus: [vec![], vec![], vec![]], extra: vec![] },
    menu_order: String::new(),
    unknown: vec![],
  };

  let mut index: usize = 0;
  let mut index_day: i8 = 0;
  let mut assign_day = false;
  let mut found_order = false;

  let index_switches = vec![
    "MONTAG".to_owned(),
    "DIENSTAG".to_owned(),
    "MITTWOCH".to_owned(),
    "DONNERSTAG".to_owned(),
    "FREITAG".to_owned(),
    "TÄGLICH FRISCH".to_owned(),
    "UNKNOWN".to_owned()
  ];

  for line in lines {
    let line_str = line.to_string().trim_start().to_owned();

    if !found_order && line_str.contains("pro 100 gr") {
      found_order = true;
      res.menu_order = line_str;
      continue;
    }

    if let Some(nr) = index_switches.clone().into_iter().position(|x| line_str.starts_with(&x)) {
      index = nr + 1;
      index_day = 0;
      assign_day = true;
    }

    match index {
      1 => separate_day(&mut res.montag, index_day, line_str.clone()),
      2 => separate_day(&mut res.dienstag, index_day, line_str.clone()),
      3 => separate_day(&mut res.mitwoch, index_day, line_str.clone()),
      4 => separate_day(&mut res.donnerstag, index_day, line_str.clone()),
      5 => separate_day(&mut res.freitag, index_day, line_str.clone()),
      _ => res.unknown.push(line_str.clone())
    }

    if assign_day {
      assign_day = false;
      index_day = 1;
    }

    if line_str.contains("Tagessalat") {
      index_day = index_day + 1;
    }
  };

  Ok(res)
}

fn separate_day(menu_types: &mut Menu, index_day: i8, line_str: String) {
  match index_day {
    0 => menu_types.tag = line_str.to_owned(),
    1 => menu_types.menus[0].push(line_str),
    2 => menu_types.menus[1].push(line_str),
    3 => menu_types.menus[2].push(line_str),
    _ => menu_types.extra.push(line_str),
  }
}
