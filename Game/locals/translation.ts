function _t(text: string):string {
    if (!local[text]) {
        console.warn('No translation found for : ', text);
    }
    return local[text] || text;
}