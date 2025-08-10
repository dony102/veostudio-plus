let CONFIG = {
  VEO_API: "",
  VEO_FAST_API: "",
  IMG2PROMPT_API: "",
  TXT2IMG_API: "",
  CHAT_API: "",
  CHANGE_CLOTHES_API: "",
  AUTH: { header: "", value: "" }
};
fetch("config.json").then(r=>r.ok?r.json():null).then(cfg=>{
  if (cfg) { CONFIG = { ...CONFIG, ...cfg, AUTH: { ...CONFIG.AUTH, ...(cfg.AUTH||{}) } }; }
}).catch(()=>{});

const $ = (id) => document.getElementById(id);
const status = (msg) => ($("status").textContent = msg);

function loadPrefs(){
  const prefs = JSON.parse(localStorage.getItem("veostudio_prefs")||"{}");
  ["mode","quality","ratio","duration","seed","guidance","neg"].forEach(k=>{
    if(prefs[k]!==undefined && $(k)) $(k).value = prefs[k];
  });
  if(prefs.theme){ document.documentElement.setAttribute("data-theme", prefs.theme); }
  $("guidanceVal").textContent = $("guidance").value;
}
function savePrefs(){
  if(!$("remember").checked) return;
  const prefs = {
    mode:$("mode").value,
    quality:$("quality").value,
    ratio:$("ratio").value,
    duration:$("duration").value,
    seed:$("seed").value,
    guidance:$("guidance").value,
    neg:$("neg").value,
    theme:document.documentElement.getAttribute("data-theme")
  };
  localStorage.setItem("veostudio_prefs", JSON.stringify(prefs));
}

$("guidance").addEventListener("input", e=> $("guidanceVal").textContent = e.target.value);
$("themeToggle").onclick = () => {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  savePrefs();
};

$("autoPrompt").onclick = async () => {
  const file = $("image").files?.[0];
  if (!file) return alert("Pilih gambar dulu.");
  status("Mengambil prompt dari gambar…");
  try {
    await new Promise(r => setTimeout(r, 700));
    $("prompt").value = "Contoh prompt otomatis dari gambar (demo).";
    status("Berhasil (demo).");
  } catch (e) {
    console.error(e);
    status("Gagal mengambil prompt.");
  }
};

$("start").onclick = async () => {
  const mode = $("mode").value;
  const payload = {
    prompt: $("prompt").value.trim(),
    quality: $("quality").value,
    ratio: $("ratio").value,
    duration: Number($("duration").value||0),
    seed: $("seed").value ? Number($("seed").value) : null,
    guidance: Number($("guidance").value),
    negative_prompt: $("neg").value.trim() || null
  };
  const file = $("image").files?.[0] || null;

  if (!payload.prompt && mode !== "img2prompt") {
    alert("Isi prompt dulu.");
    return;
  }

  status("Mengirim request…");
  $("output").textContent = "";
  savePrefs();

  const show = { mode, ...payload, hasImage:Boolean(file), imageName:file?.name||null };
  await new Promise(r => setTimeout(r, 900));
  $("output").textContent = [
    "Demo — request terkirim:",
    JSON.stringify(show, null, 2),
    "Catatan: sambungkan ke API pihak ketiga agar menghasilkan output nyata."
  ].join("\n\n");
  status("Selesai (demo).");

  const g = document.createElement("div");
  g.className = "thumb";
  const img = document.createElement("img");
  img.alt = "Demo thumbnail";
  img.src = "https://dummyimage.com/640x360/cccccc/000000&text=Preview";
  g.appendChild(img);
  $("gallery").prepend(g);
};

loadPrefs();