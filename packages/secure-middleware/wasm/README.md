```js
// Require WebAssembly module from ./wasm_bg.wasm?module
const wasmModule = require('./wasm_bg.wasm?module');

//const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;
```
