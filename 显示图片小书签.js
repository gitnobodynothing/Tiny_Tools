javascript:(function() {
    var allElements = document.querySelectorAll('*');
    var imgList = '';
    for (var i = 0; i < allElements.length; i++) {
        var element = allElements[i];
        var style = window.getComputedStyle(element);
        var backgroundImage = style.getPropertyValue('background-image');
        var isImage = element.tagName === 'IMG' || (backgroundImage && backgroundImage !== 'none');
        if (isImage) {
            var src = element.tagName === 'IMG' ? element.src : backgroundImage.slice(5, -2);
            var width = element.tagName === 'IMG' ? element.naturalWidth : element.offsetWidth;
            var height = element.tagName === 'IMG' ? element.naturalHeight : element.offsetHeight;
            if (width === 0 || height === 0) {
                continue;
            }
            var scale = Math.min(1, 500 / Math.max(width, height));
            imgList += `
                <div style="
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    margin: 10px;
                    vertical-align: top;
                ">
                    <img src="${src}" style="
                        max-width: 500px;
                        max-height: 500px;
                        width: ${width * scale}px;
                        height: ${height * scale}px;
                        object-fit: contain;
                    ">
                    <span style="
                        margin-top: 5px;
                        color: #666;
                        font-size: 12px;
                    ">(${width} x ${height})</span>
                </div>`;
        }
    }
    if (imgList !== '') {
        var newWindow = window.open();
        newWindow.document.write(`
            <div style="
                font-family: verdana, sans-serif;
                padding: 20px;
            ">
                <div style="
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: flex-start;
                ">
                    ${imgList}
                </div>
            </div>
        `);
        newWindow.document.close();
    } else {
        alert('No images found');
    }
})();
