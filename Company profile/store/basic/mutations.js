const mutations = {
    writeDataIntoState(state, payload) {
        let key  = Object.keys(payload);
        let data = Object.values(payload);

        state.objCompanyProfle[key] = data[0];
    },
    writeSelectCountry(state, payload) {
        state.objCompanyProfle.country = payload;
    },
    writeBase64Img(state, payload) {
        state.base64Img = payload;
    }
};

export default mutations;
