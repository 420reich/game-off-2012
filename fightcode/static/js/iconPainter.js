var IconPainter;

IconPainter = {
  colorDistance: function(a, b) {
    var c1, c2, da, db, dc, dh, dl, first, lab1, lab2, second, third;
    lab1 = this.XYZToLab(this.RGBToXYZ(a));
    lab2 = this.XYZToLab(this.RGBToXYZ(b));
    c1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2]);
    c2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2]);
    dc = c1 - c2;
    dl = lab1[0] - lab2[0];
    da = lab1[1] - lab2[1];
    db = lab1[2] - lab2[2];
    dh = Math.sqrt((da * da) + (db * db) - (dc * dc));
    first = dl;
    second = dc / (1 + 0.045 * c1);
    third = dh / (1 + 0.015 * c1);
    return Math.sqrt(first * first + second * second + third * third);
  },
  RGBToXYZ: function(rgb) {
    var color, i, rgbDec, x, y, z;
    rgbDec = [rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0];
    i = 0;
    while (i < 3) {
      color = rgbDec[i];
      if (color > 0.04045) {
        color = (color + 0.055) / 1.055;
        color = Math.pow(color, 2.4);
      } else {
        color = color / 12.92;
      }
      rgbDec[i] = color * 100;
      ++i;
    }
    x = rgbDec[0] * 0.4124 + rgbDec[1] * 0.3576 + rgbDec[2] * 0.1805;
    y = rgbDec[0] * 0.2126 + rgbDec[1] * 0.7152 + rgbDec[2] * 0.0722;
    z = rgbDec[0] * 0.0193 + rgbDec[1] * 0.1192 + rgbDec[2] * 0.9505;
    return [x, y, z];
  },
  XYZToLab: function(xyz) {
    var a, b, color, i, l, xyzAdj;
    xyzAdj = [xyz[0] / 95.047, xyz[1] / 100, xyz[2] / 108.883];
    i = 0;
    while (i < 3) {
      color = xyzAdj[i];
      if (color > 0.008856) {
        color = Math.pow(color, 1 / 3.0);
      } else {
        color = (7.787 * color) + (16 / 116.0);
      }
      xyzAdj[i] = color;
      ++i;
    }
    l = (116 * xyzAdj[1]) - 16;
    a = 500 * (xyzAdj[0] - xyzAdj[1]);
    b = 200 * (xyzAdj[1] - xyzAdj[2]);
    return [l, a, b];
  },
  HexToRGB: function(hex) {
    hex = parseInt((hex.indexOf("#") > -1 ? hex.substring(1) : hex), 16);
    return {
      r: hex >> 16,
      g: (hex & 0x00FF00) >> 8,
      b: hex & 0x0000FF,
      a: 1
    };
  },
  RGBAStrToRGB: function(rgbaStr) {
    var brokenValue, rgbaValue;
    brokenValue = rgbaStr.replace(/rgba\s*\(([\d\s,.]*)\)/i, "$1").split(",");
    rgbaValue = {
      r: parseInt($.trim(brokenValue[0]), 10),
      g: parseInt($.trim(brokenValue[1]), 10),
      b: parseInt($.trim(brokenValue[2]), 10),
      a: parseFloat($.trim(brokenValue[3]))
    };
    return rgbaValue;
  },
  StrToRGB: function(colorStr) {
    if (colorStr.indexOf("#") >= 0) {
      return this.HexToRGB(colorStr);
    }
    return this.RGBAStrToRGB(colorStr);
  },
  onImageReady: function(img, color, referenceColor, tolerance, callback) {
    var ctx, dist, height, imgData, luminance, pixelData, pos, width, x, y, _i, _j, _ref;
    width = img.width;
    height = img.height;
    ctx = $("<canvas width='" + width + "' height='" + height + "'>")[0].getContext("2d");
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(img, 0, 0);
    imgData = ctx.getImageData(0, 0, width, height);
    pixelData = imgData.data;
    for (y = _i = 0; 0 <= height ? _i <= height : _i >= height; y = 0 <= height ? ++_i : --_i) {
      for (x = _j = 0, _ref = width * 4; _j <= _ref; x = _j += 4) {
        pos = (y * width * 4) + x;
        dist = this.colorDistance(referenceColor, {
          r: pixelData[pos + 0],
          g: pixelData[pos + 1],
          b: pixelData[pos + 2]
        });
        if (dist < tolerance) {
          luminance = 0.3 * pixelData[pos + 0] + 0.59 * pixelData[pos + 1] + 0.11 * pixelData[pos + 2];
          pixelData[pos + 0] = color.r * (luminance / 127);
          pixelData[pos + 1] = color.g * (luminance / 127);
          pixelData[pos + 2] = color.b * (luminance / 127);
          pixelData[pos + 3] = color.a * pixelData[pos + 3];
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return callback(ctx.canvas.toDataURL());
  },
  paintIcon: function(srcImage, color, referenceColor, tolerance, callback) {
    var img,
      _this = this;
    if (tolerance == null) {
      tolerance = 27;
    }
    if (typeof color === "string") {
      color = this.StrToRGB(color);
    }
    if (typeof srcImage === "string") {
      img = document.createElement('img');
      img.onload = function() {
        return _this.onImageReady(img, color, referenceColor, tolerance, callback);
      };
      return img.src = srcImage;
    } else {
      return this.onImageReady(srcImage, color, referenceColor, tolerance, callback);
    }
  }
};
