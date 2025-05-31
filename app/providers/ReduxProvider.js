
'use client'

import { Provider } from "react-redux";
import { store } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";

import {persistor} from "../store/store"

export default function ReduxProvider({ children }) {

    return (

        <Provider store={store}>

            <PersistGate persistor={persistor}>
                {children}
            </PersistGate>

        </Provider>
    )

}

