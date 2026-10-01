import { useEffect, useRef } from "react";
import { MESH_DRIFT_FRAGMENT } from "./mesh-drift-shader";

const VERTEX = "attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}";

// Recipe values from the shader header: #101010, #F5F5F5, #B0B0B0, #3A3A3A (low → high).
const COLORS = [
	0.063, 0.063, 0.063,
	0.961, 0.961, 0.961,
	0.690, 0.690, 0.690,
	0.227, 0.227, 0.227,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
const SHAPE = [1.30, 0.56, 0.67, 0.19];
const SURFACE = [2.02, 1.17, 0.00, 1.00];
const FINISH = [0.00, 0.15, 0.020, 0.14];
const TRANSFORM = [5069.0, 2.72, 0.18, 0.0];
const SPACE = [0.09, 0.15, 0, 0]; // Cursor off: pointer stays centred.
const CURSOR = [0, 2.0, 0.65, 0.46];

function compile(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
	gl.deleteShader(shader);
	return null;
}

/** "Mesh drift" WebGL1 background. Without WebGL the page keeps its plain black ground. */
export function ShaderBackground({ className }: { className?: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const gl = canvas?.getContext("webgl", { antialias: false, premultipliedAlpha: false });
		if (!canvas || !gl) return;
		const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
		const fragment = compile(gl, gl.FRAGMENT_SHADER, MESH_DRIFT_FRAGMENT);
		const program = gl.createProgram();
		if (!vertex || !fragment || !program) return;
		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
		gl.useProgram(program);

		// One triangle that covers the viewport.
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const position = gl.getAttribLocation(program, "a_position");
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

		const at = (name: string) => gl.getUniformLocation(program, name);
		gl.uniform3fv(at("u_colors"), COLORS);
		gl.uniform4fv(at("u_shape"), SHAPE);
		gl.uniform4fv(at("u_surface"), SURFACE);
		gl.uniform4fv(at("u_finish"), FINISH);
		gl.uniform4fv(at("u_transform"), TRANSFORM);
		gl.uniform4fv(at("u_space"), SPACE);
		gl.uniform4fv(at("u_cursor"), CURSOR);
		const scene = at("u_scene");

		const resize = () => {
			const ratio = Math.min(window.devicePixelRatio || 1, 2);
			const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
			const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
				gl.viewport(0, 0, width, height);
			}
		};
		const draw = (seconds: number) => {
			resize();
			gl.uniform4f(scene, canvas.width, canvas.height, seconds * -1.05, 4.0);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		};

		// Reduced motion gets one still frame; otherwise animate while the tab is visible.
		const still = window.matchMedia("(prefers-reduced-motion: reduce)");
		const start = performance.now();
		let frame = 0;
		const loop = (now: number) => {
			draw((now - start) / 1000);
			frame = requestAnimationFrame(loop);
		};
		const run = () => {
			cancelAnimationFrame(frame);
			if (still.matches) draw(0);
			else if (!document.hidden) frame = requestAnimationFrame(loop);
		};
		const observer = new ResizeObserver(() => { if (still.matches) draw(0); });
		observer.observe(canvas);
		document.addEventListener("visibilitychange", run);
		still.addEventListener("change", run);
		// Paint once up front so a background tab or paused loop never shows a blank canvas.
		draw(0);
		run();

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			document.removeEventListener("visibilitychange", run);
			still.removeEventListener("change", run);
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
		};
	}, []);

	return <canvas aria-hidden className={className} ref={canvasRef} />;
}
