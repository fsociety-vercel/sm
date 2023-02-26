use wasm_bindgen::prelude::*;
use web_sys::console;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug)]
struct Decision {
    id: String,
}

#[wasm_bindgen]
pub async fn decide() -> String {
    console::log_1(&"rust: hello!".into());
    let mut map = HashMap::new();
    map.insert("ip", "123.456.789.000");
    let json = serde_json::to_string(&map).unwrap();
    console::log_1(&format!("rust: json: {}", json).into());

    let res = reqwest::Client::new()
        .post("https://sm-decide.vercel.app/api/decide")
        .body(json)
        .send()
        .await.unwrap();

    console::log_1(&"rust: after post".into());

    let text = res.text().await.unwrap();
    console::log_1(&format!("rust: res text: {}", text).into());
    let decision_info: Decision = serde_json::from_str(&text).unwrap();

    return decision_info.id.to_string();
    //return "123".to_string();
}
