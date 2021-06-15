import React from "react";
import ReactDOM from "react-dom";
//import * as serviceWorker from './serviceWorker';
import { Provider } from "react-redux";
import { Store } from "redux";
import roiDataStore from "./model/RoiDataModel";
import App from "./components/App";

ReactDOM.render(
  <Provider store={roiDataStore as Store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  document.getElementById("root") 
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
