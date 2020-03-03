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
    taglich: Vec<String>,
    unknown: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Menu {
    tag: String,
    traditionell: Vec<String>,
    vegetarisch: Vec<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    extra: Vec<String>,
}

#[wasm_bindgen]
pub async fn parse_skillspark_pdf(file_content: Vec<u8>) -> String {
    let content = load_pdf(file_content);

    let lines = content
        .lines()
        .into_iter()
        .filter(|l| !l.is_empty())
        .collect::<Vec<&str>>();

    let res = separate(lines).expect("Failed to separate text into struct");

    let json_result = serde_json::to_string(&res).expect("Failed to serialize struct");

    json_result
}

fn separate(lines: Vec<&str>) -> Result<MenuContainer, Box<dyn Error>> {
    let mut res = MenuContainer {
        montag: Menu { tag: String::new(), traditionell: vec![], vegetarisch: vec![], extra: vec![] },
        dienstag: Menu { tag: String::new(), traditionell: vec![], vegetarisch: vec![], extra: vec![] },
        mitwoch: Menu { tag: String::new(), traditionell: vec![], vegetarisch: vec![], extra: vec![] },
        donnerstag: Menu { tag: String::new(), traditionell: vec![], vegetarisch: vec![], extra: vec![] },
        freitag: Menu { tag: String::new(), traditionell: vec![], vegetarisch: vec![], extra: vec![] },
        taglich: vec![],
        unknown: vec![],
    };

    let mut index: usize = 0;
    let mut index_day: i8 = 0;

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

        if line_str.contains("CHF") {
            index_day = index_day + 1;
        }

        if line_str.starts_with(&index_switches[index]) {
            index = index + 1;
            index_day = 0
        }

        match index {
            1 => separate_day(&mut res.montag, index_day, line_str),
            2 => separate_day(&mut res.dienstag, index_day, line_str),
            3 => separate_day(&mut res.mitwoch, index_day, line_str),
            4 => separate_day(&mut res.donnerstag, index_day, line_str),
            5 => separate_day(&mut res.freitag, index_day, line_str),
            6 => res.taglich.push(line_str),
            _ => res.unknown.push(line_str)
        }
    };

    Ok(res)
}

fn separate_day(menu_types: &mut Menu, index_day: i8, line_str: String) {
    match index_day {
        0 => menu_types.tag = line_str.to_owned(),
        1 => menu_types.traditionell.push(line_str),
        2 => menu_types.vegetarisch.push(line_str),
        _ => menu_types.extra.push(line_str),
    }
}
