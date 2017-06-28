import React, { PropTypes } from 'react';


export const CarouselNavigatorType = {
  DOT: '0',
  NUMBER: '1'
};

class Carousel extends React.Component {
  constructor() {
    super();
    this.slidingArea = null;
    this.timer = null;
    this.setAfterTransitionFunc = null;
    this.setAfterWindowResizeFunc = null;
    this.clickSafe = false;
    this.touchObject = {};
    this.state = {
      dragging: false,
      currentSlide: 1,
      tempPositionX: undefined,
      currentPositionX: 0,
      slideCount: 0,
    };
  }

  componentWillMount() {
    const { children } = this.props;
    this.setState({
      slideCount: children.length,
      currentPositionX: this.getHorizontalPosition()
    });
  }

  componentDidMount() {
    const { isInfinite } = this.props;
    this.setAfterWindowResizeFunc = this._setAfterWindowResize.bind(this);
    window.addEventListener('resize', this.setAfterWindowResizeFunc);
    if (isInfinite) {
      this.setAfterTransitionFunc = this._setAfterTransition.bind(this);
      this.slidingArea.addEventListener('transitionend', this.setAfterTransitionFunc);
    }
  }

  componentWillUnmount() {
    if (this.setAfterWindowResizeFunc) {
      window.removeEventListener('resize', this.setAfterWindowResizeFunc);
    }
    if (this.setAfterTransitionFunc) {
      this.slidingArea.removeEventListener('transitionend', this.setAfterTransitionFunc);
    }
  }

  // TouchEvent ----------------------------------------------------------------------------------------------
  onTouchStart(e) {
    this.touchObject = {
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY
    };
    this.setState({
      dragging: true
    });
    this.handleMouseOver();
  }

  onTouchMove(e) {
    const { width } = this.props;
    const direction = this.swipeDirection(
      this.touchObject.startX,
      e.touches[0].pageX,
      this.touchObject.startY,
      e.touches[0].pageY
    );

    if (direction !== 0) {
      e.preventDefault();
    }

    const length = Math.round(Math.sqrt((e.touches[0].pageX - this.touchObject.startX) ** 2));

    this.touchObject = {
      startX: this.touchObject.startX,
      startY: this.touchObject.startY,
      endX: e.touches[0].pageX,
      endY: e.touches[0].pageY,
      length,
      direction
    };

    if ((length) > (width * 1.5)) {
      return;
    }
    this.setSlidingAreaLeft(-(length * direction));
  }

  onTouchEnd(e) {
    const { duration } = this.props;
    this.slidingArea.style.transition = `transform ${duration}s`;
    this.setSlidingAreaLeft(0);
    this.handleSwipe(e);
  }

  onTouchCancel(e) {
    this.handleSwipe(e);
  }

  // TouchEvent ----------------------------------------------------------------------------------------------

  setTimerStart() {
    const { autoPlay, autoPlayInterval } = this.props;
    const { currentSlide, slideCount } = this.state;
    if (autoPlay) {
      this.timer = setInterval(() => {
        this.setState({
          currentSlider: (currentSlide === slideCount) ? 1 : (currentSlide + 1)
        });
      }, Number(autoPlayInterval));
    }
  }

  getHorizontalPosition() {
    const {
      width,
      isInfinite
    } = this.props;
    const {
      currentSlide,
    } = this.state;
    const windowWidth = window.innerWidth;

    let positionX = (windowWidth / 2) - ((Number(width) * (Number(currentSlide) - 1)) + (Number(width) / 2));
    if (isInfinite) {
      positionX -= (Number(width) * 2);
    }

    this.setState({ currentPositionX: positionX });
    return positionX;
  }

  setSlidingAreaLeft(positionX) {
    const { currentPositionX } = this.state;
    if (positionX === 0) {
      this.setState({ tempPositionX: undefined });
      return;
    }
    this.setState({ tempPositionX: currentPositionX + positionX });
  }

  _setAfterTransition() {
    const { currentSlide, slideCount } = this.state;
    this.slidingArea.style.transition = 'none';
    if (currentSlide === (slideCount + 1)) {
      this.setState({
        currentSlide: 1
      });
    } else if (currentSlide === -1) {
      this.setState({
        currentSlide: slideCount
      });
    }
    this.setState({ dragging: false });
  }

  _setAfterWindowResize() {
    this.getHorizontalPosition();
  }

  swipeDirection(x1, x2, y1, y2) {
    let swipeAngle;
    const xDist = x1 - x2;
    const yDist = y1 - y2;
    const r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round((r * 180) / Math.PI);
    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }
    if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
      return 1;
    }
    if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
      return 1;
    }
    if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
      return -1;
    }
    return 0;
  }

  handleMouseOver() {
    if (this.props.autoPlay) {
      // 자동 재생 멈춤처리.
    }
  }

  handleSwipe() {
    const { width } = this.props;
    const { currentSlide } = this.state;
    this.clickSafe = (typeof (this.touchObject.length) !== 'undefined' && this.touchObject.length > 44);
    if (!this.clickSafe) {
      return;
    }

    if (this.touchObject.length > (width / 2)) {
      if (this.touchObject.direction === 1) {
        this.setState({
          currentSlide: currentSlide + 1
        });
      } else if (this.touchObject.direction === -1) {
        this.setState({
          currentSlide: currentSlide - 1
        });
      }
      this.setState({
        currentPositionX: this.getHorizontalPosition()
      });
    }
    this.touchObject = {};
  }

  renderSlider() {
    const {
      children,
      isInfinite,
      width,
      fullWidth,
    } = this.props;
    const { currentSlide } = this.state;
    const length = children.length;
    const itemArray = [];

    if (isInfinite) {
      itemArray.push((
        <li
          className="slide_item"
          key="slide_negative_2"
          style={{
            width: fullWidth ? '100%' : `${width}px`
          }}
        >{children[length - 2]}</li>
      ));
      itemArray.push((
        <li
          className="slide_item"
          key="slide_negative_1"
          style={{
            width: fullWidth ? '100%' : `${width}px`
          }}
        >{children[length - 1]}</li>
      ));
    }

    children.map((child, idx) => itemArray.push((
      <li
        className={`slide_item${idx === (currentSlide - 1) ? ' active' : ''}`}
        key={`slide_${idx}`}
        style={{
          width: fullWidth ? '100%' : `${width}px`
        }}
      >{child}</li>
    )));

    if (isInfinite) {
      itemArray.push((
        <li
          className="slide_item"
          key="slide_plus_1"
          style={{
            width: fullWidth ? '100%' : `${width}px`
          }}
        >{children[0]}</li>));
      itemArray.push((
        <li
          className="slide_item"
          key="slide_plus_2"
          style={{
            width: fullWidth ? '100%' : `${width}px`
          }}
        >{children[1]}</li>));
    }

    return itemArray;
  }

  renderDotNavigator() {
    const { currentSlide, slideCount } = this.state;
    const tmpArray = [];

    for (let idx = 1; idx <= slideCount; idx++) {
      tmpArray.push((
        <li className={`carousel_navigator_unit${currentSlide === idx ? ' active' : ''}`} key={`dot_navigator_${idx}`}>
          <span className="unit_dot" />
        </li>
      ));
    }
    return (
      <ul className="carousel_navigator type_dot">{tmpArray}</ul>
    );
  }

  renderNumberNavigator() {
    const { currentSlide, slideCount } = this.state;

    return (
      <p className="carousel_navigator type_number">
        <span className="current_slide_number">{currentSlide}</span>/
        <span className="total_slide_number">{slideCount}</span>
      </p>
    );
  }

  renderNavigator() {
    const { naviType } = this.props;

    if (naviType === CarouselNavigatorType.DOT) {
      return this.renderDotNavigator();
    }
    return this.renderNumberNavigator();
  }

  render() {
    const { currentPositionX, tempPositionX } = this.state;
    const { centerMode } = this.props;

    return (
      <div className="carousel_slider_wrapper">
        <div
          onTouchStart={e => this.onTouchStart(e)}
          onTouchMove={e => this.onTouchMove(e)}
          onTouchEnd={e => this.onTouchEnd(e)}
        >
          <ul
            className="slider"
            ref={ul => { this.slidingArea = ul; }}
            style={centerMode ? {
              transform: `translate3d(${tempPositionX !== undefined ? tempPositionX : currentPositionX}px, 0, 0)`,
            } : {}}
          >
            {this.renderSlider()}
          </ul>
        </div>
        {this.renderNavigator()}
      </div>
    );
  }
}

Carousel.propTypes = {
  children: PropTypes.node,
  naviType: PropTypes.string,
  fullWidth: PropTypes.bool,
  width: PropTypes.number,
  duration: PropTypes.number,
  autoPlay: PropTypes.bool,
  autoPlayInterval: PropTypes.number,
  isInfinite: PropTypes.bool,
  centerMode: PropTypes.bool
};

Carousel.defaultProps = {
  autoPlayInterval: 1000
};

export default Carousel;
