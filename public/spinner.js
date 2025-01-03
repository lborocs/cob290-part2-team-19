function hideSpinner(callback) {
    document.getElementsByClassName('spinner-back')[0].style.display = 'none';
    callback();
}
function showSpinner(callback) {
    document.getElementsByClassName('spinner-back')[0].style.display = 'flex';
    callback();
}