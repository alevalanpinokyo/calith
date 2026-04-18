const data = `<!-- VIDEO: Öne Çıkan Video URL  <iframe width="560" height="315" src="https://www.youtube.com/embed/E1BLGpE5zH0?si=D8oVd9WAHnyHGWZX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> -->`;
const videoMatch = data.match(/<!-- VIDEO: (.*?) -->/);
const videoUrl = videoMatch ? videoMatch[1] : "";
let embedUrl = videoUrl;
const iframeMatch = videoUrl.match(/src=["'](.*?)["']/);
if (iframeMatch) { embedUrl = iframeMatch[1]; }
console.log("Extracted Embed URL: " + embedUrl);
