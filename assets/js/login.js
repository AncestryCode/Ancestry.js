function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
  
function validate() {
    const email = document.forms["login"]["email"].value;
    const $message = $("#message");
    $message.text("");
    if (!validateEmail(email)) {
        $message.text(email + " no es válido.")
        return false;
    }
}
