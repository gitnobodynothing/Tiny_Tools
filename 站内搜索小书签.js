javascript:
var ax = prompt('站内搜索关键词', '');
if (ax.length > 0) {
    window.open('https://www.google.com/search?hl=zh-CN&q=site:' + encodeURIComponent(location.hostname) + '%20' + encodeURIComponent(ax));
}
void(0);