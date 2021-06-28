import React from "react";
import ReactDOM from "react-dom";
//import * as serviceWorker from './serviceWorker';
import { Provider } from "react-redux";
import { Store } from "redux";
import roiDataStore, { persistor } from "./model/RoiDataModel";
import App from "./components/App";
import { PersistGate } from "redux-persist/integration/react";

ReactDOM.render(
  <Provider store={roiDataStore as Store}>
    <PersistGate loading={null} persistor={persistor}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
