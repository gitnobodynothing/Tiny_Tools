javascript:(function(){
    var allElements = document.querySelectorAll('*');
    var imgList = '';
    var seenUrls = new Set();

    for (var i = 0; i < allElements.length; i++) {
        var element = allElements[i];
        var style = window.getComputedStyle(element);
        var backgroundImage = style.getPropertyValue('background-image');
        var src = '';
        var isImageTag = element.tagName === 'IMG';
        var isBackgroundImage = backgroundImage && backgroundImage !== 'none' && backgroundImage.startsWith('url("') && backgroundImage.endsWith('")');

        if (isImageTag) {
            src = element.src;
        } else if (isBackgroundImage) {
            let urlMatch = backgroundImage.match(/url\("?([^"]+)"?\)/);
            if (urlMatch && urlMatch[1]) {
                try {
                    src = new URL(urlMatch[1], window.location.href).href;
                } catch (e) {
                    continue;
                }
            }
        }

        if (src && !seenUrls.has(src)) {
            seenUrls.add(src);

            var width = 0;
            var height = 0;

            if (isImageTag) {
                width = element.naturalWidth;
                height = element.naturalHeight;
            } else if (isBackgroundImage) {
                width = element.offsetWidth;
                height = element.offsetHeight;
                if (width === 0 || height === 0) {
                     if (element.offsetWidth === 0 && element.offsetHeight === 0) continue;
                }
            }

            if (width === 0 || height === 0) {
                var tempImageForSize = new Image();
                tempImageForSize.src = src;
                if (tempImageForSize.complete && tempImageForSize.naturalWidth > 0) {
                    width = tempImageForSize.naturalWidth;
                    height = tempImageForSize.naturalHeight;
                } else {
                    if (width === 0 && height === 0 && isBackgroundImage) {
                        width = element.offsetWidth || 100;
                        height = element.offsetHeight || 100;
                        if(width === 0 || height === 0) continue;
                    } else if (width === 0 || height === 0) {
                        continue;
                    }
                }
            }

            var scale = Math.min(1, 500 / Math.max(width || 1, height || 1));
            var displayWidth = width * scale;
            var displayHeight = height * scale;

            imgList += `
                <div style="
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    margin: 10px;
                    vertical-align: top;
                    border: 1px solid #eee;
                    padding: 5px;
                    width: ${Math.min(500, displayWidth) + 10}px;
                    box-sizing: border-box;
                ">
                    <img src="${src}" crossorigin="anonymous" style="
                        max-width: 500px;
                        max-height: 500px;
                        width: ${displayWidth}px;
                        height: ${displayHeight}px;
                        object-fit: contain;
                        background-color: #f0f0f0;
                        border: 1px solid #ccc;
                    " onerror="
                        this.style.display='none';
                        var errorDiv = this.parentElement.querySelector('.error-message-placeholder');
                        if (errorDiv) {
                            errorDiv.innerHTML = '无法加载图片<br><span style=\'font-size:9px; color: #777; word-break:break-all;\'>' + this.src + '</span>';
                            errorDiv.style.display='flex';
                        }
                    ">
                    <span style="
                        margin-top: 5px;
                        color: #333;
                        font-size: 12px;
                        word-break: break-all;
                        text-align: center;
                    ">(${width} x ${height})</span>
                    <div class="error-message-placeholder" style="
                        display: none; 
                        width: ${Math.min(500, displayWidth)}px; 
                        min-height: ${Math.min(100, displayHeight)}px; /* Give error placeholder a min height */
                        border:1px dashed red; 
                        color:red; 
                        font-size:12px; 
                        text-align:center; 
                        align-items:center; /* for flex */
                        justify-content:center; /* for flex */
                        margin-top:5px;
                        padding: 5px;
                        box-sizing: border-box;
                        word-break: break-all;
                    "></div>
                    <a href="${src}" target="_blank" style="font-size:10px; color: #007bff; word-break:break-all; text-decoration:none; margin-top:3px;" title="${src}">打开原图</a>
                </div>`;
        }
    }

    if (imgList !== '') {
        var newWindow = window.open();
        newWindow.document.write(`
            <html>
            <head>
                <title>页面图片</title>
                <meta name="referrer" content="no-referrer">
                <style>
                    body { font-family: verdana, sans-serif; padding: 20px; margin: 0; background-color: #fff; }
                    .image-gallery-container { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-start; align-items: flex-start; }
                </style>
            </head>
            <body>
                <h2 style="text-align: center; color: #333;">提取图片来源页面： ${document.title}</h2>
                <p style="text-align: center; color: #555; font-size: 12px;">原始页面网址： <a href="${window.location.href}" target="_blank">${window.location.href}</a></p>
                <hr>
                <div class="image-gallery-container">
                    ${imgList}
                </div>
            </body>
            </html>
        `);
        newWindow.document.close();
    } else {
        alert('未在此页面找到图片。');
    }
})();