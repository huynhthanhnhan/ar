file GLTFLoader.js ở thư mục gốc (chung với index.html) có thể xử lí các phần model nhỏ 
nhưng không thể xử lí model có animation
file GLTFLoader.js trong resource/js thì ngược lại

file main.js:
	khởi tạo các canvas và đối tượng html ở đây
	gọi các module ở file artoolkit.three.js
	xử lí chuột, touch, raycast
	khởi tạo các đối tượng light, camera,... cho arScene.scene
	Load mode: khai báo URI cho model ở cuối file, có thể link đến file .gltf trong folder model hoặc link github
	Tạo vòng lặp và gọi process + render của arScene
artoolkit.three.js:
	tạo các plane và đối tượng threeJS ở đây
	hàm xử lí process và render
	listen các event từ file artoolkit.min.js
artoolkit.min.js:
	...
	xử lí kiểm tra ma trận có khác nhau nhiều không để không cần update
được đặt trong hàm process.