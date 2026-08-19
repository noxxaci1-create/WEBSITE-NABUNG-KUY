let saldo = 0;
let transaksi = [];
let targets = [];
let tabunganHari = 0;
let tanggalNabung = '';
let uangMasuk = 0;
let uangKeluar = 0;
let userName = 'Pengguna NABUNGKUY';
let avatarUrl = '';

function loadData() {
    try {
        const data = JSON.parse(localStorage.getItem('nabungkuyData'));
        if (data) {
            saldo = data.saldo || 0;
            transaksi = data.transaksi || [];
            targets = data.targets || [];
            tabunganHari = data.tabunganHari || 0;
            tanggalNabung = data.tanggalNabung || '';
            uangMasuk = data.uangMasuk || 0;
            uangKeluar = data.uangKeluar || 0;
            userName = data.userName || 'Pengguna NABUNGKUY';
            avatarUrl = data.avatarUrl || '';
        }
        const warna = localStorage.getItem('nabungkuyWarna');
        if (warna) {
            document.documentElement.style.setProperty('--primary', warna);
            document.querySelector('header').style.background = `linear-gradient(135deg, ${warna}, #3f3d9e)`;
        }
    } catch(e) {}
    updateUI();
    document.getElementById('profileName').textContent = userName;
    if (avatarUrl) document.getElementById('avatarImg').src = avatarUrl;
}

function saveData() {
    localStorage.setItem('nabungkuyData', JSON.stringify({
        saldo, transaksi, targets, tabunganHari, tanggalNabung,
        uangMasuk, uangKeluar, userName, avatarUrl
    }));
}

function updateUI() {
    document.getElementById('totalSaldo').textContent = formatRupiah(saldo);
    document.getElementById('totalTabungan').querySelector('h2').textContent = formatRupiah(saldo);
    document.getElementById('totalMasuk').textContent = formatRupiah(uangMasuk);
    document.getElementById('totalKeluar').textContent = formatRupiah(uangKeluar);
    document.getElementById('statMasuk').textContent = formatRupiah(uangMasuk);
    document.getElementById('statKeluar').textContent = formatRupiah(uangKeluar);
    document.getElementById('statSaldo').textContent = formatRupiah(saldo);

    const listTransaksiEl = document.getElementById('listTransaksi');
    if (transaksi.length === 0) {
        listTransaksiEl.innerHTML = `<p class="empty-state"><i class="fas fa-inbox"></i> Belum ada riwayat</p>`;
    } else {
        listTransaksiEl.innerHTML = transaksi.slice().reverse().map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <i class="${t.icon}"></i>
                    <div class="transaction-detail">
                        <span class="title">${t.title}</span>
                        <span class="date">${t.date}</span>
                    </div>
                </div>
                <span class="transaction-amount ${t.type}">${t.type === 'positive' ? '+' : '-'} ${formatRupiah(t.amount)}</span>
            </div>
        `).join('');
    }

    const listTargetEl = document.getElementById('listTarget');
    if (targets.length === 0) {
        listTargetEl.innerHTML = `<p class="empty-state"><i class="fas fa-bullseye"></i> Belum ada target</p>`;
    } else {
        listTargetEl.innerHTML = targets.map((t, idx) => {
            const progress = Math.min((saldo / t.amount) * 100, 100);
            return `
                <div class="target-item">
                    ${t.image ? `<img src="${t.image}" alt="Target" class="target-image" />` : ''}
                    <div class="info">
                        <span class="name">${t.name}</span>
                        <span class="progress-text">${formatRupiah(saldo)} / ${formatRupiah(t.amount)}</span>
                    </div>
                    <div class="progress-bar"><div class="fill" style="width:${progress}%"></div></div>
                    <button onclick="hapusTarget(${idx})" style="background:#ff3d00;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;align-self:flex-end;"><i class="fas fa-trash"></i> Hapus</button>
                </div>
            `;
        }).join('');
    }

    const hariEl = document.getElementById('nabungHariIni');
    const today = new Date().toDateString();
    if (tanggalNabung === today && tabunganHari > 0) {
        const targetAktif = targets[0] || { amount: 1 };
        const sisa = targetAktif.amount - saldo;
        hariEl.innerHTML = `
            <p><strong>Nabung hari ini:</strong> ${formatRupiah(tabunganHari)}</p>
            <p>Sisa target: ${sisa > 0 ? formatRupiah(sisa) : 'LUNAS!'}</p>
            <button onclick="nabungHari()"><i class="fas fa-plus-circle"></i> Nabung Lagi</button>
        `;
    } else {
        hariEl.innerHTML = `
            <p>Belum nabung hari ini.</p>
            <button onclick="nabungHari()"><i class="fas fa-plus-circle"></i> Nabung Sekarang</button>
        `;
    }

    const targetTerdekatEl = document.getElementById('targetTerdekat');
    if (targets.length > 0) {
        const t = targets[0];
        const progress = Math.min((saldo / t.amount) * 100, 100);
        targetTerdekatEl.innerHTML = `
            <p><strong>${t.name}</strong></p>
            <p>${formatRupiah(saldo)} / ${formatRupiah(t.amount)} (${Math.round(progress)}%)</p>
        `;
    } else {
        targetTerdekatEl.innerHTML = `<p>Belum ada target.</p>`;
    }

    saveData();
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function showPopup(type) {
    if (type === 'nabung') {
        document.getElementById('popupNabung').style.display = 'flex';
    } else if (type === 'kurangi') {
        document.getElementById('popupKurangi').style.display = 'flex';
    }
}
function closePopup() {
    document.querySelectorAll('.popup-modal').forEach(el => el.style.display = 'none');
}

function tambahSaldo() {
    const j = prompt('Masukkan jumlah nabungan (Rp):');
    if (j && !isNaN(j) && parseInt(j) > 0) {
        const n = parseInt(j);
        saldo += n;
        transaksi.push({ title: 'Tambah Nabung', amount: n, type: 'positive', date: new Date().toLocaleDateString('id-ID'), icon: 'fas fa-plus-circle' });
        updateUI();
        showPopup('nabung');
    }
}

function kurangiSaldo() {
    const j = prompt('Masukkan jumlah pengurangan (Rp):');
    if (j && !isNaN(j) && parseInt(j) > 0) {
        const n = parseInt(j);
        if (n > saldo) { alert('Saldo tidak mencukupi!'); return; }
        saldo -= n;
        transaksi.push({ title: 'Kurangi Nabung', amount: n, type: 'negative', date: new Date().toLocaleDateString('id-ID'), icon: 'fas fa-minus-circle' });
        updateUI();
        showPopup('kurangi');
    }
}

function nabungHari() {
    const j = prompt('Masukkan jumlah nabung hari ini (Rp):');
    if (j && !isNaN(j) && parseInt(j) > 0) {
        const n = parseInt(j);
        saldo += n;
        tabunganHari += n;
        tanggalNabung = new Date().toDateString();
        transaksi.push({ title: 'Nabung Harian', amount: n, type: 'positive', date: new Date().toLocaleDateString('id-ID'), icon: 'fas fa-piggy-bank' });
        updateUI();
        showPopup('nabung');
    }
}

function tambahUangMasuk() {
    const j = prompt('Masukkan jumlah uang masuk (Rp):');
    if (j && !isNaN(j) && parseInt(j) > 0) {
        const n = parseInt(j);
        uangMasuk += n;
        transaksi.push({ title: 'Uang Masuk', amount: n, type: 'positive', date: new Date().toLocaleDateString('id-ID'), icon: 'fas fa-arrow-down' });
        updateUI();
        showPopup('nabung');
    }
}

function tambahUangKeluar() {
    const j = prompt('Masukkan jumlah uang keluar (Rp):');
    if (j && !isNaN(j) && parseInt(j) > 0) {
        const n = parseInt(j);
        uangKeluar += n;
        transaksi.push({ title: 'Uang Keluar', amount: n, type: 'negative', date: new Date().toLocaleDateString('id-ID'), icon: 'fas fa-arrow-up' });
        updateUI();
    }
}

function setTarget() {
    const name = document.getElementById('targetName').value.trim();
    const amount = parseInt(document.getElementById('targetAmount').value);
    const fileInput = document.getElementById('targetImage');
    const file = fileInput.files[0];

    if (!name) { alert('Masukkan nama target!'); return; }
    if (!amount || isNaN(amount) || amount <= 0) { alert('Masukkan jumlah target yang valid!'); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        targets.push({ name, amount, image: e.target.result });
        document.getElementById('targetName').value = '';
        document.getElementById('targetAmount').value = '';
        fileInput.value = '';
        updateUI();
    };
    if (file) { reader.readAsDataURL(file); } 
    else { targets.push({ name, amount, image: null }); document.getElementById('targetName').value = ''; document.getElementById('targetAmount').value = ''; updateUI(); }
}

function hapusTarget(idx) {
    if (confirm('Hapus target ini?')) { targets.splice(idx, 1); updateUI(); }
}

function gantiNama() {
    const nama = document.getElementById('inputNama').value.trim();
    if (nama) {
        userName = nama;
        document.getElementById('profileName').textContent = nama;
        document.getElementById('inputNama').value = '';
        saveData();
        alert('Nama berhasil diubah!');
    } else {
        alert('Masukkan nama baru!');
    }
}

function uploadAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarUrl = e.target.result;
            document.getElementById('avatarImg').src = avatarUrl;
            saveData();
            alert('Foto profil berhasil diupload!');
        };
        reader.readAsDataURL(file);
    }
}

function gantiWarna(warna) {
    document.documentElement.style.setProperty('--primary', warna);
    document.querySelector('header').style.background = `linear-gradient(135deg, ${warna}, #3f3d9e)`;
    localStorage.setItem('nabungkuyWarna', warna);
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function showCaraPemakaian() {
    document.getElementById('caraModal').style.display = 'flex';
}
function closeCara() {
    document.getElementById('caraModal').style.display = 'none';
}

function resetData() {
    if (confirm('Yakin reset semua data?')) {
        localStorage.removeItem('nabungkuyData');
        saldo = 0; transaksi = []; targets = []; tabunganHari = 0; tanggalNabung = '';
        uangMasuk = 0; uangKeluar = 0; userName = 'Pengguna NABUNGKUY'; avatarUrl = '';
        document.getElementById('profileName').textContent = userName;
        document.getElementById('avatarImg').src = 'https://ui-avatars.com/api/?name=User&background=6C63FF&color=fff&size=100';
        updateUI();
        alert('Data direset!');
    }
}

function showTab(tab) {
    const map = { 'beranda': ['berandaSection'], 'riwayat': ['riwayatSection'], 'target': ['targetSection'], 'profile': ['profileSection'] };
    document.querySelectorAll('section').forEach(el => el.style.display = 'none');
    (map[tab] || []).forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'block'; });
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const idx = { 'beranda':0, 'riwayat':1, 'target':2, 'profile':3 }[tab];
    if (idx !== undefined) document.querySelectorAll('.nav-item')[idx].classList.add('active');
    document.getElementById('settingsPanel').style.display = 'none';
}

loadData();
showTab('beranda');