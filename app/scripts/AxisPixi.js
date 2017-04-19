import {format} from 'd3-format';

const TICK_HEIGHT = 40;
const TICK_MARGIN = 0;
const TICK_LENGTH = 5;
const TICK_LABEL_MARGIN = 4;

export class AxisPixi  {
    constructor(track) {
        this.pAxis = new PIXI.Graphics();
        this.track = track;

        this.axisTexts = [];
        this.axisTextFontFamily = "Arial";
        this.axisTextFontSize = 10;

        this.tickFormat = format('.2');
        //hi
    }

    startAxis(axisHeight) {
        let graphics = this.pAxis;

        graphics.clear();
        graphics.lineStyle(1, 0x000000, 1);

        // draw the axis line
        graphics.moveTo(0,0);
        graphics.lineTo(0, axisHeight);

    }

    createAxisTexts(valueScale, axisHeight) {
        this.tickValues = this.calculateAxisTickValues(valueScale, axisHeight);
        let i = 0;

        while (i < this.tickValues.length) {
            let tick = this.tickValues[i];

            while (this.axisTexts.length <= i) {
                let newText = new PIXI.Text(tick, 
                        {fontSize: this.axisTextFontSize + "px", 
                         fontFamily: this.axisTextFontFamily, 
                         fill: "black"});
                this.axisTexts.push(newText);

                this.pAxis.addChild(newText);
            }

            while (this.axisTexts.length > i+1) {
                let lastText = this.axisTexts.pop();
                this.pAxis.removeChild(lastText);
            }

            this.axisTexts[i].text = this.tickFormat(tick);
            this.axisTexts[i].anchor.y = 0.5;
            this.axisTexts[i].anchor.x = 0.5;
            i++;
        }
    }

    calculateAxisTickValues(valueScale, axisHeight) {
        let tickCount = Math.max(Math.ceil(axisHeight / TICK_HEIGHT), 1);
        let i = 0; 


        // create scale ticks but not all the way to the top
        let tickValues = valueScale.ticks(tickCount);
        //console.log('valueScale', valueScale, tickValues, valueScale.domain());

        if (axisHeight < 100) {
            //console.log('short axis');
        }

        if (axisHeight > 100) {
            /*
            console.log('valueScale.domain()', valueScale.domain());
            console.log('valueScale.range()', valueScale.range());
            console.log('tickValues[0]', tickValues[0], 'tickValues[-1]', tickValues[tickValues.length-1]);
            */
        }

        /*
            ticks(valueScale.invert(MARGIN_BOTTOM), 
                          valueScale.invert(this.dimensions[1] - MARGIN_TOP), 
                          tickCount);
        */

        if (tickValues.length < 1)  {
            tickValues = valueScale.ticks(tickCount + 1);
            /*
            tickValues = ticks(valueScale.invert(MARGIN_BOTTOM),
                          valueScale.invert(axisHeight - MARGIN_TOP), 
                          tickCount + 1);
            */

            if (tickValues.length > 1) {
                // sometimes the ticks function will return 0 and then 2
                // if it didn't return enough previously, we probably only want a single
                // tick
                tickValues = [tickValues[0]];
            }
        }

        return tickValues;
    }


    drawAxisLeft(valueScale, axisHeight) {
        // Draw a left-oriented axis (ticks pointing to the right)
        this.startAxis(this.pAxis, axisHeight);
        this.createAxisTexts(valueScale, axisHeight);

        let graphics = this.pAxis;

        // draw the top, potentially unlabelled, ticke
        graphics.moveTo(0, 0);
        graphics.lineTo(-(TICK_MARGIN + TICK_LENGTH), 0);

        graphics.moveTo(0, axisHeight);
        graphics.lineTo(-(TICK_MARGIN + TICK_LENGTH), axisHeight);

        for (let i = 0; i < this.axisTexts.length; i++) {
            let tick = this.tickValues[i];

            // draw ticks to the left of the axis
            this.axisTexts[i].x = - (TICK_MARGIN + TICK_LENGTH + TICK_LABEL_MARGIN + this.axisTexts[i].width / 2);
            this.axisTexts[i].y = valueScale(tick);


            graphics.moveTo(-TICK_MARGIN, valueScale(tick));
            graphics.lineTo(-(TICK_MARGIN + TICK_LENGTH), valueScale(tick));

            if (this.track && this.track.flipText) {
                this.axisTexts[i].scale.x = -1;
            }
        }

        this.hideOverlappingAxisLabels();
    }

    drawAxisRight(valueScale, axisHeight) {
        // Draw a right-oriented axis (ticks pointint to the left)
        this.startAxis(axisHeight);
        this.createAxisTexts(valueScale, axisHeight);

        let graphics = this.pAxis;

        // draw the top, potentially unlabelled, ticke
        graphics.moveTo(0, 0);
        graphics.lineTo((TICK_MARGIN + TICK_LENGTH), 0);

        graphics.moveTo(0, axisHeight);
        graphics.lineTo((TICK_MARGIN + TICK_LENGTH), axisHeight);

        for (let i = 0; i < this.axisTexts.length; i++) {
            let tick = this.tickValues[i];

            this.axisTexts[i].x = (TICK_MARGIN + TICK_LENGTH + TICK_LABEL_MARGIN + this.axisTexts[i].width / 2);
            this.axisTexts[i].y = valueScale(tick);

            graphics.moveTo(TICK_MARGIN, valueScale(tick));
            graphics.lineTo(TICK_MARGIN + TICK_LENGTH, valueScale(tick));

            if (this.track && this.track.flipText) {
                this.axisTexts[i].scale.x = -1;
            }
        }

        this.hideOverlappingAxisLabels();
    }

    hideOverlappingAxisLabels() {
        // show all tick marks initially
        for (let i = this.axisTexts.length-1; i >= 0; i--)
            this.axisTexts[i].visible = true;

        for (let i = this.axisTexts.length-1; i >= 0; i--) {
            // if this tick mark is invisible, it's not going to 
            // overlap with any others
            if (!this.axisTexts[i].visible)
                continue;

            //console.log('at[i]', this.axisTexts[i].y);
            let j = i-1;

            while (j >= 0) {
                // go through and hide all overlapping tick marks
                if ((this.axisTexts[i].y + this.axisTexts[i].height / 2) > (this.axisTexts[j].y - this.axisTexts[j].height / 2)) {
                    /*
                    console.log('hiding...');
                    console.log('i:', i, 'this.axisTexts[i].y', this.axisTexts[i].y, this.axisTexts[i].height);
                    console.log('j:', j, 'this.axisTexts[j].y', this.axisTexts[j].y, this.axisTexts[j].height);
                    */

                    this.axisTexts[j].visible = false;
                } else { 
                    // because the tick marks are ordered from top to bottom, if this
                    // one doesn't overlap, then the ones below it won't either, so 
                    // we can stop looking
                    break;
                }

                j -= 1;
            }
        }

    }


    exportVerticalAxis(axisHeight) {
        let gAxis = document.createElement('g');
        gAxis.setAttribute('class', 'axis-vertical');

        let stroke = 'black';

        if (this.track)
            stroke = this.track.options.lineStrokeColor ? this.track.options.lineStrokeColor : 'blue';

        let line = document.createElement('path');

        line.setAttribute('fill', 'transparent');
        line.setAttribute('stroke', 'black');
        line.setAttribute('id', 'axis-line');

        line.setAttribute('d',
                `M0,0 L0,${axisHeight}`);

        gAxis.appendChild(line);

        return gAxis;
    }


    createAxisSVGLine() {
        // factor out the styling for axis lines
        let stroke = 'black';
        
        if (this.track)
            stroke = this.track.options.lineStrokeColor ? this.track.options.lineStrokeColor : 'blue';

        let line = document.createElement('path');
        line.setAttribute('id', 'tick-mark');
        line.setAttribute('fill', 'transparent');
        line.setAttribute('stroke', stroke);

        return line;
    }

    createAxisSVGText(text) {
        // factor out the creation of axis texts
        let t = document.createElement('text');
        
        t.innerHTML = text;
        t.setAttribute('id', 'axis-text');
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-family', this.axisTextFontFamily);
        t.setAttribute('font-size', this.axisTextFontSize);
        t.setAttribute('dy', this.axisTextFontSize / 2 - 2);

        return t;
    }

    exportAxisLeftSVG(valueScale, axisHeight) {
        let gAxis = this.exportVerticalAxis(axisHeight);

        let line = this.createAxisSVGLine();
        gAxis.appendChild(line);

        line.setAttribute('d',
                `M0,0 L${-(TICK_MARGIN + TICK_LENGTH)},0`);

        for (let i = 0; i < this.axisTexts.length; i++) {
            let tick = this.tickValues[i];
            let text = this.axisTexts[i];

            let line = this.createAxisSVGLine();

            gAxis.appendChild(line);

            line.setAttribute('d',
                    `M${-TICK_MARGIN},${valueScale(tick)} L${-(TICK_MARGIN + TICK_LENGTH)},${valueScale(tick)}`);

            let g = document.createElement('g');
            gAxis.appendChild(g);
            if (text.visible) {
                let t = this.createAxisSVGText(text.text);
                g.appendChild(t);
            }

            g.setAttribute('transform',
            `translate(${text.position.x},${text.position.y})
             scale(${text.scale.x},${text.scale.y})`)
        }

        return gAxis;
    }

    exportAxisRightSVG(valueScale, axisHeight) {
        let gAxis = this.exportVerticalAxis(axisHeight);

        let line = this.createAxisSVGLine();
        gAxis.appendChild(line);

        line.setAttribute('d',
                `M0,0 L${TICK_MARGIN + TICK_LENGTH},0`);

        for (let i = 0; i < this.axisTexts.length; i++) {
            let tick = this.tickValues[i];
            let text = this.axisTexts[i];

            let line = this.createAxisSVGLine();

            gAxis.appendChild(line);

            line.setAttribute('d',
                    `M${TICK_MARGIN},${valueScale(tick)} L${TICK_MARGIN + TICK_LENGTH},${valueScale(tick)}`);

            let g = document.createElement('g');
            gAxis.appendChild(g);

            if (text.visible) {
                let t = this.createAxisSVGText(text.text);
                g.appendChild(t);
            }

            g.setAttribute('transform',
            `translate(${text.position.x},${text.position.y})
             scale(${text.scale.x},${text.scale.y})`)
        }

        return gAxis;
    }

    clearAxis() {
        while (this.axisTexts.length) {
            let axisText = this.axisTexts.pop();
            graphics.removeChild(axisText);
        }
    }
}