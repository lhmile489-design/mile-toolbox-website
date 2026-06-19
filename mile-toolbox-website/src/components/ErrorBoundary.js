import React from 'react';

/**
 * 错误边界：捕获子树（尤其懒加载的工具组件）运行时错误，
 * 避免单个工具崩溃导致整站白屏。fallback 为渲染函数 (reset) => node。
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return typeof this.props.fallback === 'function' ? this.props.fallback(this.reset) : this.props.fallback || null;
    }
    return this.props.children;
  }
}
