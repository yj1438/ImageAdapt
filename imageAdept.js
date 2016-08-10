(function (undefined) {
    'use stirct';
    
    var defaults = {
            container: 'body',
            type: 'cover',         //conver contain
            size: 'auto',           //'auto' [300, 200]
            imgSlt: 'img',
            orignImg: 'orign',
            times: 1,
            bgColor: '#eee'
        },
        ImageAdapt = function (domSelector, config) {
            config = objAssign(defaults, config || {});
            this.config = config;
            this.slt = typeof domSelector === 'string' ? document.querySelector(domSelector) : domSelector;
        };

    /**
     * 合并两个对象
     * @param {any} 目标obj
     * @param {any} 数值来源obj
     * @returns
     */
    function objAssign (obj1, obj2) {
        if (obj1 && obj2
            && Object.prototype.toString(obj1) === '[object Object]'
            && Object.prototype.toString(obj2) === '[object Object]') {
            var key;
            for (key in obj2) {
                if (obj2.hasOwnProperty(key)) {
                    obj1[key] = obj2[key];
                }
            }
        }
        return obj1;
    }

    /**
     * 
     * 
     * @param {any} img_w 原始图片 width
     * @param {any} img_h 原始图片 height
     * @param {any} dest_w 目标图片 width
     * @param {any} dest_h 目标图片 height
     * @returns
     */
    function coverAlgorithm (img_w, img_h, dest_w, dest_h) {
        var w_scale = img_w / dest_w,
            h_scale = img_h / dest_h,
            real_scale,
            point = {
                img_x: 0,
                img_y: 0,
                canvas_x: 0,
                canvas_y: 0,
                scale: 1
            };
        if (w_scale < h_scale) {
            real_scale = w_scale;
            point.img_x = 0;
            point.img_y = (img_h - dest_h * real_scale) / 2;
        } else {
            real_scale = h_scale;
            point.img_x = (img_w - dest_w * real_scale) / 2;
            point.img_y = 0;
        }
        point.scale = real_scale;
        return point;
    }

    function containAlgorithm (img_w, img_h, dest_w, dest_h) {
        var w_scale = img_w / dest_w,
            h_scale = img_h / dest_h,
            real_scale,
            point = {
                img_x: 0,
                img_y: 0,
                canvas_x: 0,
                canvas_y: 0,
                scale: 1
            };
        if (w_scale < h_scale) {
            real_scale = h_scale;
            point.canvas_x = (dest_w - img_w / real_scale) / 2;
            point.canvas_y = 0;
        } else {
            real_scale = w_scale;
            point.canvas_x = 0;
            point.canvas_y = (dest_h - img_h / real_scale) / 2;
        }
        point.scale = real_scale;
        return point;
    }

    /**
     * 制作适应大小的图片
     * @param {any} imgurl
     * @return {string} base64
     */
    function makeAdeptImg (imgurl, type, dest_width, dest_height, callback) {
        var img = new Image(),
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            dataURL;
        canvas.width = dest_width;
        canvas.height = dest_height;
        // img.crossOrigin = 'Anonymous';
        img.onload = function () {
            var img_width = this.width,
                img_height = this.height,
                point = type === 'contain' ? 
                    containAlgorithm(img_width, img_height, dest_width, dest_height) 
                    : coverAlgorithm(img_width, img_height, dest_width, dest_height);
            //将图片进行放缩画稿 canvas 中
            ctx.fillStyle = '#eee';
            ctx.fillRect(0, 0, dest_width, dest_height);
            ctx.drawImage(this, 
                point.img_x, 
                point.img_y, 
                img_width, 
                img_height, 
                point.canvas_x, 
                point.canvas_y, 
                img_width / point.scale, 
                img_height / point.scale);
            //将生成 base64 写进 img 中
            // console.log(canvas.toDataURL());
            dataURL = canvas.toDataURL();
            callback(dataURL);
            canvas = null;
        };
        img.src = imgurl;
    }


    ImageAdapt.prototype.init = function () {
        var _config = this.config,
            imgList = this.slt.querySelectorAll(_config.imgSlt);
        imgList.forEach(function (img, index) {
            var imgUrl = img.dataset[_config.orignImg],
                width, height;
            if (_config.size === 'auto') {
                width = img.width;
                height = img.height;
            } else {
                width = _config.size[0];
                height = _config.size[1];
            }
            makeAdeptImg(imgUrl, _config.type, width * _config.times, height * _config.times, function (base64) {
                img.src = base64;
            });
        });
    }

    /*
    function img2DataUrlViaCanvas (url, callback, format) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                dataURL;
            canvas.width = this.width;
            canvas.height = this.height;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(format);
            callback(dataURL);
            canvas = null;
        };
        img.src = url;
    }

    function img2DataUrlViaFileReader (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                callback(fileReader.result);
            };
            fileReader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();
    }
    */

    window.ImageAdapt = ImageAdapt;

    /*
     * umd 模块化
     */
    if (typeof exports !== 'undefined' ){
        exports.ImageAdapt = ImageAdapt;
    }else if ( typeof define === "function" ) {
        define([], function() {
            return ImageAdapt;
        });
    }else
        window.ImageAdapt = ImageAdapt;
})();