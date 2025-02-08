function passwordConfirm() {
    var pass = document.querySelector('input[name="password"]');
    var confirm = document.querySelector('input[name="confirm_password"]');
    var tip = document.getElementById('pass-tip');
    if (pass.value != confirm.value) {
        tip.setAttribute('aria-hidden', 'false');
        pass.classList.add('dont-match');
        confirm.classList.add('dont-match');
    } else {
        tip.setAttribute('aria-hidden', 'true');
        pass.classList.remove('dont-match');
        confirm.classList.remove('dont-match');
    }
}