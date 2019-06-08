function WebXRPolyfillInjection() {
  'use strict';

  //

  const controller = new Controller();
  const headset = new Headset();

  class EventDispatcher {
    constructor() {
      this.listeners = {};
    }

    addEventListener(key, func) {
      if (this.listeners[key] === undefined) {
        this.listeners[key] = [];
      }
      if (this.listeners[key].indexOf(func) >= 0) {
        return;
      }
      this.listeners[key].push(func);
    }

    removeEventListener(key, func) {
      if (this.listeners[key] === undefined) {
        return;
      }
      if (this.listeners[key].indexOf(func) === -1) {
        return;
      }
      this.listeners[key] = this.listeners[key].splice(this.listeners[key].indexOf(func), 1);
    }

    dispatchEvent(key, value) {
      if (this.listeners[key] === undefined) {
        return;
      }
      const listeners = this.listeners[key].slice();
      for (let i = 0, il = listeners.length; i < il; i++) {
        listeners[i](value);
      }
    }
  }

  class XR {
    supportsSession(mode) {
      return Promise.resolve();
    }

    requestSession(mode) {
      return Promise.resolve(new XRSession());
    }
  }

  class XRSession extends EventDispatcher {
    constructor() {
      super();
      this.frame = new XRFrame();
      this.renderState = {};

      controller.setSession(this);
      this.inputSources = [controller.getGamepad()];

      headset.setSession(this);
    }

    updateRenderState(state) {
      this.renderState = state;
    }

    requestReferenceSpace(type) {
      return Promise.resolve(new XRReferenceSpace());
    }

    requestAnimationFrame(func) {
      requestAnimationFrame(() => {
        func(performance.now(), this.frame);
      });
    }

    end() {
      this.dispatchEvent('end', {});
    }

    _fireSelectStart(controller) {
      this.dispatchEvent('selectstart', {type: 'selectstart', inputSource: controller.getGamepad()});
    }

    _fireSelectEnd(controller) {
      this.dispatchEvent('selectend', {type: 'selectend', inputSource: controller.getGamepad()});
    }
 }

  class XRFrame {
    constructor() {
      this._pose = new XRPose();
      this._viewerPose = new XRViewerPose();
    }

    getViewerPose(space) {
      return this._viewerPose;
    }

    getPose(targetRaySpace, referenceSpace) {
      return this._pose;
    }
  }

  class XRPose {
    constructor() {
      this.transform = new XRRigidTransform();
      this.transform.matrix[0] = 1;
      this.transform.matrix[5] = 1;
      this.transform.matrix[10] = 1;
      this.transform.matrix[15] = 1;
    }
  }

  class XRViewerPose {
    constructor() {
      this.views = [new XRView(0), new XRView(1)];
    }
  }

  class XRView {
    constructor(eye) {
      this.eye = eye;
      this.projectionMatrix = new Float32Array(16);
      this.transform = new XRRigidTransform();
    }
  }

  class XRRigidTransform {
    constructor() {
      this.position;
      this.orientation;
      this.matrix = new Float32Array(16);
      this.inverse = {
        matrix: new Float32Array(16)
      };
    }
  }

  class XRReferenceSpace {

  }

  class XRWebGLLayer {
    constructor(session, gl) {
      this.framebuffer = null;
    }

    getViewport(view) {
      return {
        x: view.eye === 0 ? 0 : window.innerWidth / 2 * window.devicePixelRatio,
        y: 0,
        width: window.innerWidth / 2 * window.devicePixelRatio,
        height: window.innerHeight * window.devicePixelRatio
      };
    }
  }

  if (navigator.xr === undefined) {
    navigator.xr = new XR();
  }

  if (window.XRWebGLLayer === undefined) {
    window.XRWebGLLayer = XRWebGLLayer;
  }

  console.log(navigator);
}
