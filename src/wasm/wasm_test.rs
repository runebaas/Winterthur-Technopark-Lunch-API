use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn stuff(input: String) -> String {
    println!("Wasm Stuff: {}", input);

    input + "-wasm"
}
