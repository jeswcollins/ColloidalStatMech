// JavaScript source code
/* --- HELPER FUNCTIONS ---------------------------------------------------------------------------------- */

function svgSupported()
    /*
      Returns true if the browser supports HTML5 with inline SVG, false otherwise. Assumes that the root SVG
      element has an ID value of "svgElement".
    */ {
    var svgElement = document.getElementById("svgElement"); // Required for Mozilla, this line not necessary for IE9 or Chrome.

    return svgElement.namespaceURI == "http://www.w3.org/2000/svg";
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

function getRandomInteger(min, max)
    /*
      Inclusively returns a random integer between min and max. Assumes min < max (min and max need not be
      integers nor positive).

      As an example, if min = -4 and max = 3, then the returned random value is between -4 and 3. Likewise, if
      min = -4.1 and max = 3.1, then the returned random value is between -5 and 4.
    */ {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

function getRandomReal(min, max)
    /*
      Returns a random real number x such that min <= x < max. Assumes min < max (min and max need not be
      positive). Note that the returned random value can be very close to max but it will never equal max.
    */ {
    return Math.random() * (max - min) + min;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

function getRandomColor()
    /*
      Returns and RBG color value string, as in "rgb(120, 70, 255)". Stay away from overly dark and light
      colors. That is, we avoid RGB values below 30 (i.e., too dark) and RGB values above 230 (i.e., too light).
    */ {
    var randomColor1 = getRandomInteger(30, 230); // Generates a random integer between 30 and 230.
    var randomColor2 = getRandomInteger(30, 230);
    var randomColor3 = getRandomInteger(30, 230);

    return "rgb(" + randomColor1 + ", " + randomColor2 + ", " + randomColor3 + ")";
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* -- BALL HELPER FUNCTIONS ------------------------------------------------------------------------------ */

function ball_cx(ball)
    /*
      Returns the x-coordinate of the center of the given ball.
    */ {
    return ball.cx.baseVal.value;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

function ball_cy(ball)
    /*
      Returns the y-coordinate of the center of the given ball.
    */ {
    return ball.cy.baseVal.value;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

function ball_r(ball)
    /*
      Returns the radius of the given ball.
    */ {
    return ball.r.baseVal.value;
}

/* -- BALL PROTOTYPES ------------------------------------------------------------------------------------ */

SVGCircleElement.prototype.dx = function (that)
    /*
      Returns the distance between the two x-coordinates of the ball centers.
    */ {
    return ball_cx(this) - ball_cx(that);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

SVGCircleElement.U = 0; // Each ball has an energy U associated with it.  U is the sum of all the bonds the particle participates in

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


SVGCircleElement.prototype.dy = function (that)
    /*
      Returns the distance between the two y-coordinates of the ball centers.
    */ {
    return ball_cy(this) - ball_cy(that);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

SVGCircleElement.prototype.d = function (that)
    /*
      Returns the distance between (the centers) of the two balls.
    */ {
    return Math.sqrt(this.dx(that) * this.dx(that) + this.dy(that) * this.dy(that)); // The distance between the center points of both balls, using the classic distance-between-two-points formula (for 2D points).
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

SVGCircleElement.prototype.isOverlapping = function (that)
    /*
      Returns true if this ball is touching or overlapping "that" ball.
    */ {
    var d = this.d(that); // The distance between the center points of both balls.

    if (this.i == that.i) // True if both balls are the same ball - just a safety measure here.
        return (false);

    return d <= (ball_r(this) + ball_r(that)); // Draw this out on paper and it'll make sense.
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/* -- BALL FUNCTIONS ------------------------------------------------------------------------------------- */

function getRandomBallRadius()
    /*
      Returns a random ball radius between constants.minRadius and constants.maxRadius.
    */ {
    return getRandomInteger(constants.minRadius, constants.maxRadius);
}

