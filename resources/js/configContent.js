/**
 * content of front side
 */
var list_Front_Content = ["Màn hình kích thước 6.9 inch sử dụng tấm nền Dynamic AMOLED 2X",
    "Màn hình trên Galaxy S20 Ultra có tần số quét lên tới 120 Hz",
    "Công nghệ HDR10+ cho trải nghiệm giải trí chơi game với chất lượng tuyệt vời",
    "Được bảo vệ bằng kính cường lực Gorilla Glass 6 với độ bền cao",
    "Sử dụng màn hình công nghệ Infinity O khoét lỗ cho camera selfie"
];

var list_Camera_Content = ["Camera đỉnh cao, độ phân giải siêu khủng 108 MP",
    "Sự kết hợp độc đáo giữa bộ 4 camera siêu khủng",
    "Chế độ Space Zoom 100x số 1 trên thế giới smartphone",
    "Tính năng quay phim chất điện ảnh 8K",
    "Kết hợp cùng công nghệ chống rung quang học OIS"
]

var list_Back_Content = ["Vi xử lý mạnh mẽ mang tên Exynos 990 với xung nhịp cao nhất có thể đạt tới  2.73 GHz",
    "Dung lượng RAM 12 GB và bộ nhớ trong 128 GB, hỗ trợ thẻ nhớ ngoài lên đến 1T",
    "điểm hiệu năng mạnh mẽ lên tới 503.122 điểm",
    "Pin dung lượng lớn 5000 mAh có hỗ trợ sạc nhanh 45 W",
    "Chế độ sạc không dây công suất 15W"
];

/**
 * 
 * @param {*} monitor - {portraint | landscape} detect is portraint mode on mobile
 */
function loadDivContent(monitor) {
    var divContent = document.createElement('div');
    divContent.id = 'divContent';
    divContent.className = 'divContent';

    var renderCanvas = document.getElementById('renderCanvasContext');
    if (monitor == 'landscape') {
        divContent.style.width = parseFloat(renderCanvas.offsetWidth.toString()) * 4 / 5 + 'px';
        divContent.style.height = parseFloat(renderCanvas.offsetHeight.toString()) * 4 / 5 + 'px';
    } else {
        divContent.style.width = parseFloat(renderCanvas.offsetHeight.toString()) * 4 / 5 + 'px';
        divContent.style.height = parseFloat(renderCanvas.offsetWidth.toString()) * 4 / 5 + 'px';
    }

    var left = renderCanvas.getBoundingClientRect().left;
    var top = renderCanvas.getBoundingClientRect().top;

    divContent.clientTop = top;
    divContent.clientLeft = left;

    var close = document.createElement('span');
    close.className = 'close';
    close.id = 'btnClose';
    close.textContent = 'X';
    divContent.appendChild(close);
    var content = document.createElement('div');
    content.id = 'content';

    divContent.appendChild(content);
    divContent.style.display = 'none';
    divContent.addEventListener('mouseup', function(ev) {
        triggerEvent(renderCanvas, 'mouseup');
    })
    divContent.addEventListener('touchend', function(ev) {
        triggerEvent(renderCanvas, 'touchend');
    })
    close.addEventListener('mousedown', function() {
        divContent.style.display = 'none';
        setIsDetect(true);
    })
    close.addEventListener('touchend', function() {
        divContent.style.display = 'none';
        setIsDetect(true);
    })
    document.body.appendChild(divContent);
}
/**
 * Set content for divContent by create childs div element
 * 
 * @param {*} content - {front, back, camera} is type of content with positon on mobile
 */
function setDivContent(typeContent) {
    var content = document.getElementById('content');
    content.textContent = "";
    var listContent;
    switch (typeContent) {
        case 'front':
            listContent = list_Front_Content;
            break;
        case 'back':
            listContent = list_Back_Content;
            break;
        case 'camera':
            listContent = list_Camera_Content;
            break;
    }
    if (listContent && listContent.length) {
        for (var i = 0; i < listContent.length; i++) {
            var childDiv = document.createElement('div');
            childDiv.textContent = listContent[i];
            content.appendChild(childDiv);
        }
        divContent.style.display = 'block';
    }
}

function triggerEvent(el, type) {
    if ('createEvent' in document) {
        // modern browsers, IE9+
        var e = document.createEvent('HTMLEvents');
        e.initEvent(type, false, true);
        el.dispatchEvent(e);
    } else {
        // IE 8
        var e = document.createEventObject();
        e.eventType = type;
        el.fireEvent('on' + e.eventType, e);
    }
}