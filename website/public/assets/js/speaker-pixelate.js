function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

// Hexagon
function Hexagon(color, pos, size) {
  this.color = color;
  this.x = pos[0];
  this.y = pos[1];
  this.z = pos[2] || 0; // scale
  this.width = size;
  this.height = size/7*8;
}

Hexagon.prototype.dist = 0; // dist is padding. Set it as a prop on Hexagon rather than a global

// Hexagon.draw
Hexagon.prototype.draw = function (ctx, x, y) {
  if (x == null || y == null) {
    x = this.x;
    y = this.y;
  }
  var width  = this.width  + (this.width  * this.z), // scaled width
    height = this.height + (this.height * this.z), // scaled height
    cx  = x * (width + this.dist) - y * (width + this.dist) / 2,
    cy  = y * (3/4 * height + this.dist);

  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - height/2);
  ctx.lineTo(cx + width/2, cy - height/4);
  ctx.lineTo(cx + width/2, cy + height/4);
  ctx.lineTo(cx, cy + height/2);
  ctx.lineTo(cx - width/2, cy + height/4);
  ctx.lineTo(cx - width/2, cy - height/4);
  ctx.lineTo(cx, cy - height/2);
  ctx.fill();
};

CanvasRenderingContext2D.prototype.clear = function (preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }
};

var objs = document.querySelectorAll('.speaker-pixelate');

for(var i=0;i<objs.length;i++) {
  var canvas = objs.item(i),
      ctx = canvas.getContext('2d'),
      color = hexToRgb(canvas.getAttribute('data-color')),
      hexes = [],
      variant;

  for(var a=0;a<26;a++) {
    for(var b=0;b<20;b++) {
      variant = color.map(function (item, index) {
        var up = 80,
            down = -20,
            adjust = Math.floor(Math.random() * (up - down)) + down;
        return item + adjust;
      });
      // console.log(variant);
      hexes.push(new Hexagon("rgb(" + variant.join(",") + ")", [a, b], 16));
    }
  }

  for (var h = hexes.length; h--;) {
    hexes[h].draw(ctx);
  }

}