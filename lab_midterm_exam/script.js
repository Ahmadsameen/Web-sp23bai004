function clicked() {
    const t = document.querySelector(".mega-menu");
    t.classList.toggle("hide");
    t.classList.toggle("show");
}

const megaMenuItems = document.querySelectorAll('.mega-menu-item');
megaMenuItems.forEach(item => {
    item.addEventListener('click', function() {
        const megaMenu = document.querySelector(".mega-menu");
        megaMenu.classList.add("hide");
        megaMenu.classList.remove("show");
    });
});

document.addEventListener('click', function(event) {
    const megaMenu = document.querySelector(".mega-menu");
    const previousTasksLink = event.target.closest('a[onclick="clicked()"]');
    
    if (megaMenu.classList.contains('show') && !megaMenu.contains(event.target) && !previousTasksLink) {
        megaMenu.classList.add("hide");
        megaMenu.classList.remove("show");
    }
});