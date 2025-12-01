import React from "react";
const BASE_URL = 'http://localhost:9090/api';
export const api = {
    get : async (endpoint) => { 
        const resp= await fetch(BASE_URL + endpoint);
        return resp.json();     
    }
}
