(function() {

function pascalTriangle(n) {
    return (function pasc(iteration, array) {
        var ret;
        if (iteration) {
            ret = [ 1 ];
            array.reduce(function(a, b) {
                ret.push(a + b);
                return b;
            });
            return pasc(iteration - 1, ret.concat(1));
        } else {
            return array;
        }
    }(Math.abs(n | 0), [ 1 ]));
}

function getGaussianMatrix(size) {
    var y, x, i, matSum,
        pasc = pascalTriangle(size - 1),
        mat = [];

    for (y = 0; y < size; y++) {
        for (x = 0; x < size; x++) {
            mat.push(pasc[y] * pasc[x]);
        }
    }
    matSum = mat.reduce(function(a, b) {
        return a + b;
    });
    return mat.map(function(n) {
        return n / matSum;
    });
}

function writePixelData(imageData, x, y, pixel) {
    x = ~~x;
    y = ~~y;

    var data, o, i,
        width = imageData.width,
        height = imageData.height;

    if (x < 0 || width <= x || y < 0 || height <= y) {
        return;
    }

    data = imageData.data;
    o = (y * width + x) << 2;

    for (i = 0; i < 4; i++) {
        data[o + i] = pixel[i];
    }
}

function readPixelData(imageData, x, y) {
    x = ~~x;
    y = ~~y;

    var data = imageData.data,
        o = (y * imageData.width + x) << 2;

    return [
        data[o],
        data[o + 1],
        data[o + 2],
        data[o + 3]
    ];
}

function comparePixelData(p1, p2) {
    return !(p1[0] !== p2[0] ||
        p1[1] !== p2[1] ||
        p1[2] !== p2[2] ||
        p1[3] !== p2[3]);
}

// http://ynomura.dip.jp/archives/2008/07/post_30.html
function strokeThinCircle(ctx, cx, cy, r, color) {
    cx = ~~cx;
    cy = ~~cy;
    r = ~~r;

    var left = cx - r,
        top = cy - r,
        r2 = r << 1,
        width = r2 + 1,
        height = width,
        imageData = ctx.getImageData(left, top, width, height),
        data = imageData.data,
        px = r,
        py = 0,
        error = -r,
        dx = -(r << 1) + 2,
        dy = 1;

    writePixelData(imageData, r, 0, color);
    writePixelData(imageData, 0, r, color);
    writePixelData(imageData, r, r2, color);
    writePixelData(imageData, r2, r, color);

    while (px > py) {
        py++;
        error += dy;
        dy += 2;

        if (error > 0) {
            px--;
            error += dx;
            dx += 2;
        }

        writePixelData(imageData, r + px, r + py, color);
        writePixelData(imageData, r - px, r + py, color);
        writePixelData(imageData, r + px, r - py, color);
        writePixelData(imageData, r - px, r - py, color);
        writePixelData(imageData, r + py, r + px, color);
        writePixelData(imageData, r - py, r + px, color);
        writePixelData(imageData, r + py, r - px, color);
        writePixelData(imageData, r - py, r - px, color);
    }

    ctx.putImageData(imageData, left, top);
}

function strokeThickCircle(ctx, cx, cy, r, color, lineWidth) {
    cx = ~~cx;
    cy = ~~cy;
    r = ~~r;
    lineWidth = ~~lineWidth;

    var px, py, right, bottom, l,
        thickness = lineWidth >> 1,
        rr = r + thickness,
        rr2 = rr << 1,
        width = rr2 + 1,
        height = width,
        left = cx - rr,
        top = cy - rr,
        imageData = ctx.getImageData(left, top, width, height),
        data = imageData.data;

    for (px = -rr, right = rr; px <= right; px++) {
        for (py = -rr, bottom = rr; py <= bottom; py++) {
            l = Math.sqrt(px * px + py * py);
            if (Math.abs(l - r) < thickness) {
                writePixelData(imageData, rr + px, rr + py, color);
            }
        }
    }

    ctx.putImageData(imageData, left, top);
}

function fillCircle(ctx, cx, cy, r, color, lineWidth) {
    cx = ~~cx;
    cy = ~~cy;
    r = ~~r;
    lineWidth = ~~lineWidth;

    var px, py, l,
        thickness = lineWidth >> 1,
        rr = r + thickness,
        rr2 = rr << 1,
        width = rr2 + 1,
        height = width,
        left = cx - rr,
        top = cy - rr,
        imageData = ctx.getImageData(left, top, width, height),
        data = imageData.data;

    for (px = -rr; px <= rr; px++) {
        for (py = -rr; py <= rr; py++) {
            l = Math.sqrt(px * px + py * py);
            if (l <= rr) {
                writePixelData(imageData, rr + px, rr + py, color);
            }
        }
    }

    ctx.putImageData(imageData, left, top);
}

enchant.Surface.prototype.strokeCircle = function(x, y, r, color, lineWidth) {
    if (lineWidth && lineWidth >= 2) {
        strokeThickCircle(this.context, x, y, r, color, lineWidth);
    } else {
        strokeThinCircle(this.context, x, y, r, color);
    }
};

enchant.Surface.prototype.fillCircle = function(x, y, r, color, lineWidth) {
    fillCircle(this.context, x, y, r, color, lineWidth || 1);
};

enchant.Surface.prototype.fillPixel = function(x, y, color) {
    var width = this.width,
        height = this.height,
        imageData = this.context.getImageData(0, 0, width, height),
        toReplace = readPixelData(imageData, x, y);

    function searchNewPoint(x, y, leftX, rightX) {
        var inFillArea = false;
        while (leftX <= rightX || inFillArea) {
            if (leftX < width && comparePixelData(readPixelData(imageData, leftX, y), toReplace)) {
                inFillArea = true;
            } else if (inFillArea === true) {
                searchLine(leftX - 1, y);
                inFillArea = false;
            }
            leftX++;
        }
    }

    function searchLine(x, y) {
        var leftX = x,
            rightX = x;

        if (!comparePixelData(readPixelData(imageData, x, y), toReplace)) {
            return;
        }
        while (rightX < width - 1 && comparePixelData(readPixelData(imageData, rightX + 1, y), toReplace)) {
            rightX++;
            writePixelData(imageData, rightX, y, color);
        }
        while (0 < leftX && comparePixelData(readPixelData(imageData, leftX - 1, y), toReplace)) {
            leftX--;
            writePixelData(imageData, leftX, y, color);
        }
        writePixelData(imageData, x, y, color);
        if (y + 1 <= height - 1) {
            searchNewPoint(x, y + 1, leftX, rightX);
        }
        if (0 <= y - 1) {
            searchNewPoint(x, y - 1, leftX, rightX);
        }
    }

    searchLine(x, y);
    this.context.putImageData(imageData, 0, 0);
};

enchant.Surface.prototype.getAlphaMask = function() {
    var i, l, a,
        width = this.width,
        height = this.height,
        sf = new enchant.Surface(width, height),
        imageData = this.context.getImageData(0, 0, width, height),
        data = imageData.data;

    for (i = 0, l = data.length; i < l; i += 4) {
        a = data[i + 3];
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = a * 255;
    }

    sf.context.putImageData(imageData, 0, 0);

    return sf;
};

enchant.Surface.prototype.getPadded = function(spWidth, spHeight, padWidth, padHeight) {
    var x, y, ox, oy, px, py,
        fRows = Math.floor(this.width / spWidth),
        fCols = Math.floor(this.height / spHeight),
        sf = new enchant.Surface(this.width + fRows * padWidth * 2, this.height + fCols * padHeight * 2),
        img = this._element,
        ctx = sf.context;

    for (y = 0; y < fCols; y++) {
        oy = y * spHeight;
        py = oy + 2 * y * padHeight + padHeight;
        for (x = 0; x < fRows; x++) {
            ox = x * spWidth;
            px = ox + 2 * x * padWidth + padWidth;
            ctx.drawImage(img, ox, oy, spWidth, spHeight, px, py, spWidth, spHeight);
        }
    }

    return sf;
};

enchant.Surface.prototype.getBlured = function(blurSize) {
    var mw, nw, c, o, y, x, i, j, n, m, r, g, b, a,
        width = this.width,
        height = this.height,
        sf = new enchant.Surface(width, height),
        imageData = this.context.getImageData(0, 0, width, height),
        data = imageData.data,
        destImageData = this.context.createImageData(width, height),
        destData = destImageData.data,
        size = Math.floor(blurSize) * 2 + 1,
        mat = getGaussianMatrix(size),
        me = Math.floor(blurSize),
        ms = -me,
        yw = 0;

    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            i = (yw + x) << 2;
            mw = 0;
            nw = ms * width;
            r = g = b = a = 0;
            for (n = ms; n <= me; n++) {
                for (m = ms; m <= me; m++) {
                    c = mw + m + me;
                    o = (nw + m) << 2;
                    if (0 <= x + m && x + m < width &&
                        0 <= y + n && y + n < height) {
                        r += data[i + o] * mat[c];
                        g += data[i + o + 1] * mat[c];
                        b += data[i + o + 2] * mat[c];
                        a += data[i + o + 3] * mat[c];
                    }
                }
                mw += size;
                nw += width;
            }
            destData[i] = r;
            destData[i + 1] = g;
            destData[i + 2] = b;
            destData[i + 3] = a;
        }
        yw += width;
    }

    sf.context.putImageData(destImageData, 0, 0);

    return sf;
};

}());
