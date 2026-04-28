
(function() {
    const docWidth = document.documentElement.offsetWidth;
    const elements = document.querySelectorAll('*');
    const results = [];
    elements.forEach(el => {
        if (el.offsetWidth > docWidth + 1) {
            results.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                width: el.offsetWidth,
                docWidth: docWidth,
                html: el.outerHTML.substring(0, 100)
            });
        }
    });
    console.table(results);
    if (results.length > 0) {
        alert("OVERFLOW DETECTED: " + results[0].tag + " " + results[0].className);
    }
})();
