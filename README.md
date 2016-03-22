# music
音乐可视化展示效果
用到了H5 canvas css3 webAudui API 
nodejs+express+ejs 搭建平台

new MusicVisualizer({
    size:FFTsize*2,  /*必需|FFT是离散傅里叶变换的快速算法，为32-2048之间值的2的倍数，默认为2048。由于在应用的时候，解码所得到的实际音频频域数据个数为FFTsize的一半，因此在初始化的时候最好取FFTsize*2 */
    visualizer:drawFunc,  /*必需|根据得到的实际音频频域数据个数进行绘制，drawFunc是自定义的绘制方法*/
    loadingName:"loadingClassName"  /*可选|用于加载画面的类名*/
});
