use wasm_bindgen::prelude::*;
use pdf_extract::{PlainTextOutput, output_doc};
use lopdf::Document;

#[wasm_bindgen]
extern "C" {
  // console.log()
  #[wasm_bindgen(js_namespace = console)]
  pub fn log(s: &str);
}

pub fn load_pdf(file_content: Vec<u8>) -> String {
  let mut content = String::new();
  {
    let mut output = PlainTextOutput::new(&mut content);

    let doc = Document::load_mem(&file_content).expect("Failed to load doc");

    output_doc(&doc, &mut output).expect("Failed extract data from doc");
  }

  content
}
