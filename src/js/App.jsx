import React from 'react';
import Carousel, { CarouselNavigatorType } from './Carousel';

class App extends React.Component {
  render() {
    return (
      <div>
        <Carousel
          naviType={CarouselNavigatorType.DOT}
          autoPlay={Boolean(true)}
          autoPlayInterval={500}
          isInfinite={Boolean(true)}
          fullWidth={Boolean(false)}
          width={100}
        >
          <div className="a">a</div>
          <div className="b">b</div>
          <div className="c">c</div>
        </Carousel>
      </div>
    );
  }
}

export default App;