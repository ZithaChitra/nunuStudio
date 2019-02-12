"use strict";

/**
 * Perspective camera, used for 3D scenes with objects getting smaller as they get away from the camera.
 * 
 * Based on THREE.PerspectiveCamera, original documentation available at https://threejs.org/docs/index.html#Reference/Cameras/PerspectiveCamera.
 * 
 * @class PerspectiveCamera
 * @extends {PerspectiveCamera}
 * @module Cameras
 * @param {Number} fov Field of view
 * @param {Number} aspect Aspect ratio
 * @param {Number} near Near projection plane (how closer can be objects visible by this camera)
 * @param {Number} far Far projection plane (how far can be objects visible by this camera)
 */
/**
 * Camera field of view in degrees.
 * 
 * @property fov
 * @default 50
 * @type {Number}
 */
/**
 * Camera aspect ratio X/Y.
 * 
 * @property aspect
 * @default 1.0
 * @type {Number}
 */
/**
 * Camera zoom.
 * 
 * @property zoom
 * @default 1.0
 * @type {Number}
 */
function PerspectiveCamera(fov, aspect, near, far)
{
	/**
	 * Camera viewport offset.
	 * 
	 * Values range from 0.0 to 1.0 in screen space.
	 * 
	 * @property offset
	 * @type {Vector2}
	*/
	this.offset = new THREE.Vector2(0.0, 0.0);

	/**
	 * Camera viewport size.
	 * 
	 * Values range from 0.0 to 1.0 in screen space.
	 * 
	 * @property viewport
	 * @type {Vector2}
	*/
	this.viewport = new THREE.Vector2(1.0, 1.0);
	
	THREE.PerspectiveCamera.call(this, fov, aspect, near, far);

	this.name = "camera";

	/**
	 * Clear screen color flag.
	 * 
	 * @property clearColor
	 * @default false
	 * @type {boolean}
	*/
	this.clearColor = true;

	/**
	 * Clear depth flag.
	 * 
	 * @property clearDepth
	 * @default false
	 * @type {boolean}
	*/
	this.clearDepth = true;

	/**
	 * Clear stencil buffer flag.
	 * 
	 * @property clearDepth
	 * @default false
	 * @type {boolean}
	*/
	this.clearStencil = true;

	/**
	 * Camera draw order preference.
	 * 
	 * If more than one camera has the same order value the draw order is undefined for those cameras.
	 * 
	 * @property order
	 * @default 0
	 * @type {Number}
	*/
	this.order = 0;

	//Render pass
	var renderPass = new RenderPass();
	renderPass.renderToScreen = true;

	/**
	 * Effect composed of this camera. Is used to render the scene to the screen and apply effects.
	 *
	 * It is inialized with a RenderPass attached to it.
	 * 
	 * @property composer
	 * @type {EffectComposer}
	 */
	this.composer = new EffectComposer();
	this.composer.addPass(renderPass);
}

PerspectiveCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);

/**
 * Render a scene using this camera and the internal EffectComposer.
 *
 * @method render
 * @param {WebGLRenderer} renderer WebGL renderer to use.
 * @param {Scene} scene Scene to be rendered.
 */
PerspectiveCamera.prototype.render = function(renderer, scene)
{
	this.composer.render(renderer, scene, this, 0.016);
};

/**
 * Resize this camera, should be called every time after resizing the screen.
 *
 * @method resize
 * @param {Number} x Width.
 * @param {Number} y Height.
 */
PerspectiveCamera.prototype.resize = function(x, y)
{
	this.composer.setSize(x * this.viewport.x, y * this.viewport.y);
	
	for(var i = 0; i < this.children.length; i++)
	{
		this.children[i].resize(x, y);
	}
};

/**
 * Destroy camera object and remove it from the scene.
 * 
 * @method destroy
 */
PerspectiveCamera.prototype.destroy = function()
{
	var scene = this.getScene();
	if(scene !== null)
	{
		scene.removeCamera(this);
	}
	
	THREE.Object3D.prototype.destroy.call(this);
};

/**
 * Update camera projection matrix.
 * 
 * Should be called after chaging projection parameters.
 * 
 * @method updateProjectionMatrix
 */
PerspectiveCamera.prototype.updateProjectionMatrix = function()
{
	var top = this.near * Math.tan(THREE.Math.DEG2RAD * 0.5 * this.fov) / this.zoom;
	var height = 2 * top;
	var width = this.aspect * height * this.viewport.x / this.viewport.y;
	var left = -0.5 * width;

	if(this.filmOffset !== 0)
	{
		left += this.near * this.filmOffset / this.getFilmWidth();
	}

	this.projectionMatrix.makePerspective(left, left + width, top, top - height, this.near, this.far);
};

PerspectiveCamera.prototype.toJSON = function(meta)
{
	var data = THREE.PerspectiveCamera.prototype.toJSON.call(this, meta);

	data.object.clearColor = this.clearColor;
	data.object.clearDepth = this.clearDepth;
	data.object.clearStencil = this.clearStencil;

	data.object.viewport = this.viewport.toArray();
	data.object.offset = this.offset.toArray();

	data.object.order = this.order;
	data.object.composer = this.composer.toJSON();

	return data;
};
