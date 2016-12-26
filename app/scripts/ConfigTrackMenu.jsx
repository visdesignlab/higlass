import React from 'react';
import ReactDOM from 'react-dom';

import {ContextMenuContainer, ContextMenuItem} from './ContextMenuContainer.jsx';
import {SeriesListMenu} from './SeriesListMenu.jsx';

export class ConfigTrackMenu extends ContextMenuContainer {
    constructor(props) {
        /**
         * A window that is opened when a user clicks on the track configuration icon.
         */
        super(props);

        

        this.seriesRefs = {};
        
    }

    componentDidMount() {
        super.componentDidMount();
    }

    handleSeriesMouseEnter(evt, uid) {
        let domNode = evt.currentTarget;
        let boundingRect = domNode.getBoundingClientRect();
        //console.log('seriesMouseEnter:', domNode);
        console.log('boundingRect:', boundingRect);

        this.setState({
            submenuShown: uid,
            submenuSourceBbox: boundingRect
        });
    }

    handleMouseLeave(evt) {
        return;
    }

    handleOtherMouseEnter(evt) {
        this.setState({
            submenuShown: null
        });
    }

    getSeriesItems() {
        // check if this is a combined track (has contents)
        let series = this.props.track.contents ? this.props.track.contents : [this.props.track];

        return series.map(x => {
                return (
                    <div 
                        ref={c => this.seriesRefs[x.uid] = c}
                        className={"context-menu-item"}
                        key={x.uid}
                        onMouseEnter={e => this.handleSeriesMouseEnter(e, x.uid)}
                        onMouseLeave={e => this.handleMouseLeave(e)}
                    >
                        <span className='context-menu-span'
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {x.uid}
                            <img src="images/play.svg"
                                 className = "play-icon"
                            />

                        </span>
                    </div>
                )

        });
    }

    getSubmenu() {
        if (this.state.submenuShown) {
            let bbox = this.state.submenuSourceBbox;
            let position = null;

            if (this.state.orientation == 'left') {
               position = {
                    'left': this.state.left,
                    'top': bbox.top
                };
            } else {
                position = {
                    'left': this.state.left + bbox.width + 7,
                    'top': bbox.top
                }
            }

            console.log('position:', position);

            return (<SeriesListMenu
                        position={position}
                        orientation={this.state.orientation}
                    />);
        } else {
            return (<div />);
        }
    }

    render() {
        return(
                <div className={'context-menu'}
                        ref={c => this.div = c}
                        style={{ 
                                position: 'fixed',
                                left: this.state.left,
                                 top: this.state.top,
                                border: "1px solid black"
                              }}
                >
                    {this.getSeriesItems()}
                    <hr />
                    <ContextMenuItem 
                        text={'Add Data'} 
                        onMouseEnter={(e) => this.handleOtherMouseEnter(e) }
                        />
                    <ContextMenuItem text={'Close Track'} />
                    <ContextMenuItem text={'Settings'} />

                    {this.getSubmenu()}
                </div>
                )
    }
}
