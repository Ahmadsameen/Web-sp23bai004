document.getElementById('checkoutForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    let isValid = true;

  
    document.querySelectorAll('.error').forEach(error => error.textContent = '');
    document.querySelectorAll('input, textarea').forEach(input => input.classList.remove('invalid'));


    const fullName = document.getElementById('fullName');
    if (!fullName.value.match(/^[A-Za-z\s]+$/)) {
        document.getElementById('fullNameError').textContent = 'youre not maths:)';
        fullName.classList.add('invalid');
        isValid = false;
    }

    const email = document.getElementById('email');
    if (!email.value || !email.checkValidity()) {
        document.getElementById('emailError').textContent = 'wrong';
        email.classList.add('invalid');
        isValid = false;
    }

    const phone = document.getElementById('phone');
    if (!phone.value.match(/^[0-9]{10,15}$/)) {
        document.getElementById('phoneError').textContent = 'Enter 11 digits';
        phone.classList.add('invalid');
        isValid = false;
    }

    const address = document.getElementById('address');
    if (!address.value) {
        document.getElementById('addressError').textContent = 'Address not provided';
        address.classList.add('invalid');
        isValid = false;
    }

    const creditCard = document.getElementById('creditCard');
    if (!creditCard.value.match(/^[0-9]{16}$/)) {
        document.getElementById('creditCardError').textContent = 'Enter 16 digits';
        creditCard.classList.add('invalid');
        isValid = false;
    }

    const expiryDate = document.getElementById('expiryDate');
    const today = new Date();
    const selectedDate = new Date(expiryDate.value);
    if (!expiryDate.value || selectedDate <= today) {
        document.getElementById('expiryDateError').textContent = 'how u in past bro';
        expiryDate.classList.add('invalid');
        isValid = false;
    }

    const cvv = document.getElementById('cvv');
    if (!cvv.value.match(/^[0-9]{3}$/)) {
        document.getElementById('cvvError').textContent = 'Enter 3 digits';
        cvv.classList.add('invalid');
        isValid = false;
    }

    if (isValid) {
        alert('Order placed.');
        document.getElementById('checkoutForm').reset();
    }
});