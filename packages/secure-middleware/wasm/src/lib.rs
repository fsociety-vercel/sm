use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct Decision {
    pub id: String,
}

#[wasm_bindgen]
pub async fn decide(ip: String) -> Result<JsValue, JsValue> {
    let mut map = HashMap::new();
    map.insert("ip", ip);

    let res = reqwest::Client::new()
        .post("https://sm-decide.vercel.app/api/decide")
        .json(&map)
        .send()
        .await?;

    let text = res.text().await?;
    let decision_info: Decision = serde_json::from_str(&text).unwrap();

    Ok(serde_wasm_bindgen::to_value(&decision_info)?)
}