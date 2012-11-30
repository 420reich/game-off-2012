IconPainter =
    colorDistance: (a, b) ->
        lab1 = @XYZToLab(@RGBToXYZ(a))
        lab2 = @XYZToLab(@RGBToXYZ(b))
        c1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2])
        c2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2])
        dc = c1 - c2
        dl = lab1[0] - lab2[0]
        da = lab1[1] - lab2[1]
        db = lab1[2] - lab2[2]
        dh = Math.sqrt((da * da) + (db * db) - (dc * dc))
        first = dl
        second = dc / (1 + 0.045 * c1)
        third = dh / (1 + 0.015 * c1)
        Math.sqrt first * first + second * second + third * third

    RGBToXYZ: (rgb) ->
        rgbDec = [rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0]
        i = 0

        while i < 3
            color = rgbDec[i]
            if color > 0.04045
                color = (color + 0.055) / 1.055
                color = Math.pow(color, 2.4)
            else
                color = color / 12.92
            rgbDec[i] = color * 100
            ++i
        x = rgbDec[0] * 0.4124 + rgbDec[1] * 0.3576 + rgbDec[2] * 0.1805
        y = rgbDec[0] * 0.2126 + rgbDec[1] * 0.7152 + rgbDec[2] * 0.0722
        z = rgbDec[0] * 0.0193 + rgbDec[1] * 0.1192 + rgbDec[2] * 0.9505
        [x, y, z]

    XYZToLab: (xyz) ->
        xyzAdj = [xyz[0] / 95.047, xyz[1] / 100, xyz[2] / 108.883]
        i = 0

        while i < 3
            color = xyzAdj[i]
            if color > 0.008856
                color = Math.pow(color, 1 / 3.0)
            else
                color = (7.787 * color) + (16 / 116.0)
            xyzAdj[i] = color
            ++i
        l = (116 * xyzAdj[1]) - 16
        a = 500 * (xyzAdj[0] - xyzAdj[1])
        b = 200 * (xyzAdj[1] - xyzAdj[2])
        [l, a, b]

    HexToRGB: (hex) ->
        hex = if (hex.indexOf("#") > -1) then hex.substring(1) else hex
        if hex.length == 3
            hex = hex.split('').reduce((a, b) ->
                return a + b + b
            , '')
        hex = parseInt(hex, 16)
        r: hex >> 16
        g: (hex & 0x00FF00) >> 8
        b: (hex & 0x0000FF)
        a: 1

    RGBAStrToRGB: (rgbaStr) ->
        brokenValue = rgbaStr.replace(/rgba\s*\(([\d\s,.]*)\)/i, "$1").split(",")
        rgbaValue =
            r: parseInt($.trim(brokenValue[0]), 10)
            g: parseInt($.trim(brokenValue[1]), 10)
            b: parseInt($.trim(brokenValue[2]), 10)
            a: parseFloat($.trim(brokenValue[3]))

        rgbaValue

    StrToRGB: (colorStr) ->
        return @HexToRGB(colorStr)  if colorStr.indexOf("#") >= 0
        @RGBAStrToRGB colorStr

    onImageReady: (img, color, referenceColor, tolerance, callback) ->
        width = img.width
        height = img.height

        ctx = $("<canvas width='" + width + "' height='" + height + "'>")[0].getContext("2d")
        ctx.globalCompositeOperation = "copy"
        ctx.drawImage(img, 0, 0)

        imgData = ctx.getImageData(0, 0, width, height)
        pixelData = imgData.data

        for y in [0..height]
            for x in [0..width * 4] by 4
                pos = (y * width * 4) + x

                dist = @colorDistance(referenceColor,
                    r: pixelData[pos + 0]
                    g: pixelData[pos + 1]
                    b: pixelData[pos + 2]
                )

                if dist < tolerance
                    luminance = 0.3 * pixelData[pos + 0] + 0.59 * pixelData[pos + 1] + 0.11 * pixelData[pos + 2]
                    pixelData[pos + 0] = color.r * (luminance / 127)
                    pixelData[pos + 1] = color.g * (luminance / 127)
                    pixelData[pos + 2] = color.b * (luminance / 127)
                    pixelData[pos + 3] = color.a * pixelData[pos + 3]

        ctx.putImageData(imgData, 0, 0)
        callback(ctx.canvas.toDataURL())

    paintIcon: (srcImage, color, referenceColor, tolerance = 27, callback) ->

        color = @StrToRGB(color) if typeof color is "string"

        if typeof srcImage is "string"
            img = document.createElement('img')
            img.onload = =>
                @onImageReady(img, color, referenceColor, tolerance, callback)
            img.src = srcImage
        else
            @onImageReady(srcImage, color, referenceColor, tolerance, callback)
