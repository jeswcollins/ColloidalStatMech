        /* --- Constants ----------------------------------------------------------------------------------------- */
        var constants = {
            ballStrokeColor: "#444", // The color the border for all balls.
        };

        /* -- GLOBALS -------------------------------------------------------------------------------------------- */
        var innerRadius = 15*1.25;//Draw circles with this radius
        var hardRadius = 20*1.25;//Disallow center-center distances smaller than 2*hardRadius
        var softRadius = 25*1.25;//Attractive bonds drawn between friendly pairs of circles with center-center distances <2*softRadius
        var currentCircle;//Only one current circle
        var currentLabel;//Only one current label
        var currentSwapSet;//Only one current SwapSet
        var currentButton;//Only one current button
        var selectedStroke = 'red';
        var selectedStrokeWidth = 5;
        var defaultCircleStroke = '#444';
        var defaultCircleStrokeWidth = 1;
        
        var colorSpecificity = new Object();//array of colors and colors that bind to each color
        var idSpecificity = new Object();//array of circle ids and ids that bind to each id
        /* --- FUNCTIONS ---------------------------------------------------------------------------------- */

        function SwapSet(id,coordframe,textlabels) {
	    {textlabels = typeof textlabels !== 'undefined' ? textlabels : true;}
            // PUBLIC
            this.balls = new Array();
            this.ballcount = 0;
	    this.bondcount = 0;
	    this.bondmax = 0;
	    this.id = id;//understood ids: permutable, not_particularly, picky
	    this.frame = document.getElementById(coordframe);
	    this.colorSpecificity = new Object();
            this.requestAnimationFrameID = 0;
	    this.labels=textlabels;
        }
        
        SwapSet.prototype.initialize = function ()
            /*
              Create ball elements, position the balls, and render them.
            */ {
            var n_per_row;
	    n_per_row=7;
            this.drawRhombusPath(n_per_row,n_per_row);
	    //Next Lines Depend on Color/Specificity of Circles
	    if (this.id != 'permutable'){
		this.rainbowColorCircles();}
            this.addBondsAdjacentandSpecifyInteractions();//.bind(this)
        }

        /*SwapSet's drawing functions*/
        SwapSet.prototype.addCircle = function (x, y) {
            //Adds a circle at x,y.  Doesn't check if others are nearby.
            var svgElement = document.getElementById("svgElement");
            var ballElement,labelElement,textNode,groupElement,buttonElement;

            ballElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            ballElement.r.baseVal.value = innerRadius; // The radius of the ball.
            ballElement.cx.baseVal.value = x;
            ballElement.cy.baseVal.value = y;
            ballElement.i = this.ballcount;
            ballElement.setAttribute("class", this.id+" sphere");
            ballElement.id = this.id+" ball " + ballElement.i;
            ballElement.style.fill = 'gray';
            ballElement.style.stroke = constants.ballStrokeColor;

	    groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
	    groupElement.id = "g "+ballElement.id;
	    groupElement.setAttribute("class", this.id+" sphere_label_group");
	    groupElement.appendChild(ballElement);

	    //Also create associated svg text
		labelElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
		labelElement.setAttribute("x", x);
		labelElement.setAttribute("y", y+hardRadius*this.ballcount.toString.length/4);
		labelElement.setAttribute("font-family", "sans-serif");
		labelElement.setAttribute("font-size", hardRadius*.75);
		labelElement.setAttribute("text-anchor", "middle");
		labelElement.setAttribute("fill", "white");
		/*labelElement.setAttribute("stroke", "black");
		labelElement.setAttribute("stroke-width", .2);*/
	        if (this.labels!=true) {
		    labelElement.setAttribute("fill-opacity",0);
		    labelElement.setAttribute("stroke-opacity", 0);
		    }
		labelElement.id = this.id+" label " + ballElement.i;

		textNode=document.createTextNode(this.ballcount);
		labelElement.appendChild(textNode);
		groupElement.appendChild(labelElement);
	    
	    //create transparent svg circle and put on top of text label as last element in group
	    buttonElement=document.createElementNS("http://www.w3.org/2000/svg", "circle")
	    buttonElement.setAttribute("class", "btn");
            buttonElement.r.baseVal.value = innerRadius; // The radius of the ball.
            buttonElement.cx.baseVal.value = x;
            buttonElement.cy.baseVal.value = y;
	    buttonElement.id = "btn "+ballElement.id;
	    buttonElement.i=this.ballcount;
	    buttonElement.onclick = this.selectCircle.bind(this);

	    groupElement.appendChild(buttonElement);

            this.ballcount = this.ballcount + 1;
	    this.frame.appendChild(groupElement);
	    
        }
        
        SwapSet.prototype.ColorAll = function (c) {
            //color all circles color c
            var spheres;
            //var svgElement = document.getElementById("svgElement");
            spheres = document.getElementsByClassName(this.id+" sphere");
	    //console.log(spheres);
            for (var i = 0; i < spheres.length; i++) {
                spheres[i].style.fill = c;
            }
        }

        SwapSet.prototype.rainbowColorCircles=function() {
            //Recolor circles using hsl spectra, so each circle gets unique color
            var spheres;
            var svgElement = document.getElementById("svgElement");
            spheres = document.getElementsByClassName(this.id+" sphere");
            for (var i = 0; i < spheres.length; i++) {
                var rgb = hslToRgb(i / spheres.length, 1, .5);
                spheres[i].style.fill = "rgb(" + rgb + ")"
            }
        }

        SwapSet.prototype.removeBonds = function () {
            //remove all bonds
        }
        
        SwapSet.prototype.addBondsAdjacentandSpecifyInteractions = function () {
            //For each sphere, add bonds between it and any spheres a distance greater than hardRadius but less than or equal to softRadius away
            var spheres,sphere_label_groups;
            spheres = document.getElementsByClassName(this.id+" sphere");
            sphere_label_groups = document.getElementsByClassName(this.id+" sphere_label_group");
            var svgElement = document.getElementById("svgElement");
            var bondElement;

            //Add a bond to each pair of spheres if they are adjacent
            for (var i = 0; i < spheres.length; i++) {
                for (var j = i; j < spheres.length; j++) {
                    if (spheres[i].d(spheres[j]) <= softRadius * 2 + .1 * softRadius && spheres[i].d(spheres[j]) > hardRadius * 2) {
                        bondElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        bondElement.setAttribute("class", this.id+" bond");
                        bondElement.id = spheres[i].id + ',' + spheres[j].id;
                        bondElement.style.stroke = 'black';
                        bondElement.x1.baseVal.value = spheres[i].cx.baseVal.value;
                        bondElement.y1.baseVal.value = spheres[i].cy.baseVal.value;
                        bondElement.x2.baseVal.value = spheres[j].cx.baseVal.value;
                        bondElement.y2.baseVal.value = spheres[j].cy.baseVal.value;

                        //keep track of number of bonds
			this.bondcount = this.bondcount + 1;
			this.bondmax = this.bondmax + 1;

                        //add colors to specificity matrix
                        colorSpecificity[spheres[i].style.fill] = colorSpecificity[spheres[i].style.fill] + ' ' + spheres[j].style.fill;
                        colorSpecificity[spheres[j].style.fill] = colorSpecificity[spheres[j].style.fill] + ' ' + spheres[i].style.fill;
                        //add ids to specificity matrix
                        idSpecificity[spheres[i].id] = idSpecificity[spheres[i].id] + ' ' + spheres[j].id;
                        idSpecificity[spheres[j].id] = idSpecificity[spheres[j].id] + ' ' + spheres[i].id;
                                 
		        this.frame.insertBefore(bondElement, sphere_label_groups[0]);
                    }
                }
            }
        }


        SwapSet.prototype.drawRhombusPath = function (n,l) {
            
            //Draws a path that forms a portion of a hexagonal lattice in shape of a rhombus
            var x;
            var y;
            var d;
            var shift;
            shift = 20;
            d = softRadius * 2;//50 now

            var ymax=(l-1)*d*Math.sin(3.14/3)
         
            for (var i = 0; i < n; i++){
                for (var j = 0; j < l; j++) {
                    if (i % 2) {
                        x = ((l-1)*Math.cos(3.14/3)*d) +i*d- j * Math.cos(3.14 / 3) * d + shift
                        y = ymax - j * Math.sin(3.14 / 3) * d + shift
                    } else {
                        x = i * d + j * Math.cos(3.14 / 3) * d + shift
                        y = j * Math.sin(3.14 / 3) * d + shift
                    }
                    this.addCircle(x, y);
                }
            }
        }

        function coordDisplay(event) {
            event = event || window.event;
        }

        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
        /* -- HTML INTERFACE FUNCTIONS -------------------------------------------------------------------------------- */

	SwapSet.prototype.selectCircle = function (event) {
            /*The function is invoked at click events. If two circles in the same SwapSet get selected, one after the other, this function swaps their positions.  If you select the currently selected circle, it gets deselected. If you select a circle in a different SwapSet*/

            //If no circle had been currently selected, set current circle variable to the first selected circle and return
            if (!currentCircle) {
                //currentCircle = event.srcElement;
		
		console.log(this.id+" ball "+event.target.id);
		currentCircle = document.getElementById(this.id+" ball "+event.target.i);
		currentButton = event.target;

		//Hold currentLabel variable
		currentLabel = document.getElementById(this.id+" label "+event.target.i);

		//change stroke color and width to indicate selection
                currentCircle.style.stroke = selectedStroke;
                currentCircle.style.strokeWidth = selectedStrokeWidth;
		//keep track of current SwapSet
		currentSwapSet=this.id;
                console.log(currentCircle.cx.baseVal.value + ',' + currentCircle.cy.baseVal.value)
                return;
            }

            //If there was already a selected circle, save it and set the currentCircle variable to the new selection
            var previousCircle,previousLabel,previousButton;
            previousCircle = currentCircle;
            previousCircle.style.stroke = defaultCircleStroke;
            previousCircle.style.strokeWidth = defaultCircleStrokeWidth;
	    previousButton = currentButton
            //currentCircle = event.target;
	    currentCircle = document.getElementById(this.id+" ball "+event.target.i);
	    currentButton = event.target;
	    //same for SwapSet.labels
	    previousLabel = currentLabel;
	    currentLabel = document.getElementById(this.id+" label "+event.target.i);

	    //If different SwapSet, however, reset previousCircle and return
	    if (this.id != currentSwapSet) {
                currentCircle.style.stroke = defaultCircleStroke;
		currentCircle.style.strokeWidth = defaultCircleStrokeWidth;
		previousCircle = undefined;
		previousLabel = undefined;
		currentCircle = undefined;
		currentLabel = undefined;
		currentButton = undefined;
		previousButton = undefined;
		return;
		}


            //If the previous selection is the same as the latest, reset both variables
            if (previousCircle == currentCircle) {
                currentCircle.style.stroke = defaultCircleStroke;
                currentCircle.style.strokeWidth = defaultCircleStrokeWidth;
                previousCircle.style.stroke = defaultCircleStroke;
                previousCircle.style.strokeWidth = defaultCircleStrokeWidth;
                currentCircle = undefined;
                previousCircle = undefined;
		currentButton = undefined;
		previousButton = undefined;

		//same for SwapSet.labels
		previousLabel = undefined;
		currentLabel = undefined;
                return;
            }

            //If there was already a selected circle, and it is not the current selection, swap the two circles
            if (previousCircle) {
                
                var svgElement = document.getElementById("svgElement");
                var bondElement;

                currentCircle.style.stroke = selectedStroke;
                currentCircle.style.strokeWidth = selectedStrokeWidth;

                //save center x and y values...
                var ccx = currentCircle.cx.baseVal.value;
                var ccy = currentCircle.cy.baseVal.value;
                var pcx = previousCircle.cx.baseVal.value;
                var pcy = previousCircle.cy.baseVal.value;
		//...of button too
                var cbx = currentButton.cx.baseVal.value;
                var cby = currentButton.cy.baseVal.value;
                var pbx = previousButton.cx.baseVal.value;
                var pby = previousButton.cy.baseVal.value;

		//if SwapSet.labels
		var clx,cly,plx,ply;
		clx=currentLabel.getAttribute("x");
		cly=currentLabel.getAttribute("y");
		plx=previousLabel.getAttribute("x");
		ply=previousLabel.getAttribute("y");

                //swap positions of two circles...
                currentCircle.cx.baseVal.value = pcx;
                currentCircle.cy.baseVal.value = pcy;
                previousCircle.cx.baseVal.value = ccx;
                previousCircle.cy.baseVal.value = ccy;
		//...and buttons
                currentButton.cx.baseVal.value = pbx;
                currentButton.cy.baseVal.value = pby;
                previousButton.cx.baseVal.value = cbx;
                previousButton.cy.baseVal.value = cby;

		//if SwapSet.labels
                currentLabel.setAttribute("x", plx);
                currentLabel.setAttribute("y", ply);
                previousLabel.setAttribute("x", clx);
                previousLabel.setAttribute("y", cly);
		
                //remove selection highlight
                currentCircle.style.stroke = defaultCircleStroke;
                currentCircle.style.strokeWidth = defaultCircleStrokeWidth;
                previousCircle.style.stroke = defaultCircleStroke;
                previousCircle.style.strokeWidth = defaultCircleStrokeWidth;
                //update bonds. color red if not specificed.

                //remove bonds
                var bonds = document.getElementsByClassName(this.id+" bond")
                while (bonds[0]) {
                    bonds[0].parentNode.removeChild(bonds[0])
                }		
		this.bondcount = 0;
		
                //draw bonds between adjacent pair of spheres whose colors are also in the specificity matrix
                var sphere_label_groups = document.getElementsByClassName(this.id+" sphere_label_group")
                var spheres = document.getElementsByClassName(this.id+" sphere");

                for (var j = 0; j < spheres.length; j++) {
                    for (var i = 0; i < j; i++) {
                        if (spheres[j].d(spheres[i]) <= softRadius * 2 + .1 * softRadius && spheres[j].d(spheres[i]) > hardRadius * 2) {
			    //above checks  if spheres are adjacent

                            //check if spheres[j] color bonds with previousCircle color
                            var index = colorSpecificity[spheres[i].style.fill].indexOf(spheres[j].style.fill);
                            if (index != -1) {//form a black bond (minimum energy bond) -- case for permutable, not_particularly and picky

                                bondElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
                                bondElement.setAttribute("class", this.id+" bond");
                                bondElement.id = spheres[i].id + ',' + spheres[j].id;
                                bondElement.style.stroke = 'black';
                                bondElement.x1.baseVal.value = spheres[i].cx.baseVal.value;
                                bondElement.y1.baseVal.value = spheres[i].cy.baseVal.value;
                                bondElement.x2.baseVal.value = spheres[j].cx.baseVal.value;
                                bondElement.y2.baseVal.value = spheres[j].cy.baseVal.value;
				//keep track of total bond number
				this.bondcount = this.bondcount+1;

                                //this.frame.insertBefore(bondElement, spheres[0]);
				this.frame.insertBefore(bondElement, sphere_label_groups[0]);
                            }

                            else {
				if (this.id=='not_particularly'){
				//form a red (higher energy) bond
				bondElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
                                bondElement.setAttribute("class", this.id+" bond");
                                bondElement.id = spheres[i].id + ',' + spheres[j].id;
                                bondElement.style.stroke = 'red';
                                bondElement.setAttribute("stroke-width", 1.5);
				bondElement.setAttribute("stroke-dasharray",5);
                                bondElement.x1.baseVal.value = spheres[i].cx.baseVal.value;
                                bondElement.y1.baseVal.value = spheres[i].cy.baseVal.value;
                                bondElement.x2.baseVal.value = spheres[j].cx.baseVal.value;
                                bondElement.y2.baseVal.value = spheres[j].cy.baseVal.value;
                                //this.frame.insertBefore(bondElement, spheres[0]);
				this.frame.insertBefore(bondElement, sphere_label_groups[0]);
				    }
				//no need to form a bond (permutable or picky)
                            }
                        }
                    }
                    //clear current and previous circle variables so a new pair may be selected
                }
                currentCircle = undefined;
                previousCircle = undefined;
                currentButton = undefined;
                previousButton = undefined;
		//If SwapSet Labels
		currentLabel = undefined;
		previousLabel = undefined;
            }
	 console.log(this.id+" bondmax-bondcount: "+(this.bondmax-this.bondcount));
	 console.log(this.id+" bondcount: "+this.bondcount);
        }



        /**
        * Converts an HSL color value to RGB. Conversion formula
	* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	* Assumes h, s, and l are contained in the set [0, 1] and
	* returns r, g, and b in the set [0, 255].
	*
	* @param   Number  h       The hue
	* @param   Number  s       The saturation
	* @param   Number  l       The lightness
	* @return  Array           The RGB representation
	*/
        function hslToRgb(h, s, l) {
            var r, g, b;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {
                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }

