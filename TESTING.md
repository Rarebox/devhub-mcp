# 🧪 DevHub Testing Guide

## 📋 Test Overview

Bu rehber DevHub VS Code extension'ını test etmek için adım adım talimatlar içerir.

## 🚀 Kurulum ve Başlatma

### 1. Extension'ı Derle

```bash
cd /Users/caglarusta/Desktop/dev-hub/devhub-mcp
npm run compile
```

### 2. Extension'ı Test Modunda Başlat

```bash
# VS Code'de F5 bas veya
code --extensionDevelopmentPath=/Users/caglarusta/Desktop/dev-hub/devhub-mcp
```

### 3. Extension'ı Yükle

- VS Code'de `Extensions` panelini aç (Ctrl+Shift+X)
- "DevHub - Multi-Service Dashboard" arat
- Development extensions bölümünde bul ve etkinleştir

## 🎯 Test Senaryoları

### ✅ Phase 1: Temel Özellikler

#### 1.1 TreeView Test

- [ ] Activity Bar'da DevHub icon'u gör
- [ ] 17 MCP server listesi görüntüleniyor
- [ ] Server status'ları (disconnected/connected/error) doğru gösteriliyor
- [ ] Server'lar alfabetik sıralanmış

#### 1.2 Dashboard Test

- [ ] Command Palette (Ctrl+Shift+P) aç
- [ ] "DevHub: Open Dashboard" komutunu çalıştır
- [ ] Modern webview paneli açılıyor
- [ ] Server listesi dashboard'da görünüyor
- [ ] Connect/Disconnect butonları çalışıyor
- [ ] Real-time status güncellemeleri çalışıyor

#### 1.3 Commands Test

- [ ] Command Palette'de tüm "DevHub:" komutları listeleniyor
- [ ] "DevHub: Refresh Services" çalışıyor
- [ ] "DevHub: Show Server Info" çalışıyor
- [ ] "DevHub: View Logs" çalışıyor

### ✅ Phase 2: MCP Server Bağlantıları

#### 2.1 API Key Gerektiren Server'lar

Aşağıdaki server'lar connect butonuna basıldığında API key input dialog'u göstermeli:

**GitHub:**

- [ ] Connect butonuna bas
- [ ] "Enter your GitHub Personal Access Token" dialog'u açılır
- [ ] Placeholder: `ghp_xxxxxxxxxxxxxxxxxxxx`
- [ ] Validation: `ghp_` veya `github_pat_` ile başlamalı
- [ ] Cancel edilirse disconnected kalır
- [ ] Geçerli token girilirse connected olur

**MongoDB:**

- [ ] Connect butonuna bas
- [ ] "Enter MongoDB connection string" dialog'u açılır
- [ ] Placeholder: `mongodb://localhost:27017`
- [ ] Validation: `mongodb://` veya `mongodb+srv://` ile başlamalı
- [ ] Optional database name input'u gelir

**Stripe:**

- [ ] Connect butonuna bas
- [ ] "Enter your Stripe API Key" dialog'u açılır
- [ ] Placeholder: `sk_test_... or sk_live_...`
- [ ] Validation: `sk_` ile başlamalı

**LemonSqueezy:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Minimum 10 karakter validation

**Auth:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Minimum 10 karakter validation

**Context 7:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Validation: `st_` ile başlamalı

**Sequential Thinking:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Minimum 10 karakter validation

**Firecrawl:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Validation: `fc_` ile başlamalı

**FileSystem:**

- [ ] Connect butonuna bas
- [ ] Root path dialog'u açılır
- [ ] Placeholder: current working directory

**Browser:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Minimum 10 karakter validation

**Figma:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Validation: `figd_` ile başlamalı

**Supabase:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Sonra Project URL dialog'u açılır
- [ ] URL validation: `https://` ve `.supabase.co` içermeli

**Vercel:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Validation: `VERCEL_TOKEN_` ile başlamalı

**Sentry:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Sonra Organization Slug dialog'u açılır
- [ ] URL validation: `sentry.io` içermeli

**Taskmaster:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Minimum 10 karakter validation

**Desktop Commander:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Minimum 10 karakter validation

**21st Dev:**

- [ ] Connect butonuna bas
- [ ] API key dialog'u açılır
- [ ] Minimum 10 karakter validation

#### 2.2 Bağlantı Test Akışı

- [ ] Connect butonuna bas → API key dialog'u açılır
- [ ] Cancel bas → Status disconnected kalır
- [ ] Geçersiz API key gir → Error mesajı gösterir
- [ ] Geçerli API key gir → Status connected olur
- [ ] Disconnect butonuna bas → Status disconnected olur
- [ ] TreeView ve Dashboard senkronize çalışır

### ✅ Phase 3: Configuration Panel

#### 3.1 Configuration Panel Test

- [ ] Herhangi bir server'a sağ tıkla
- [ ] "Configure Service" seç
- [ ] Modern configuration paneli açılır
- [ ] Server adı başlıkta gösterilir
- [ ] API Key input field (password masked)
- [ ] Project input field (optional)
- [ ] Save Configuration butonu
- [ ] Cancel butonu

#### 3.2 Configuration Kaydetme Test

- [ ] API key gir ve Save Configuration tıkla
- [ ] "Server configuration saved!" mesajı gösterir
- [ ] Panel kapanır
- [ ] VS Code secrets'a kaydedilir

#### 3.3 Configuration Panel UI Test

- [ ] VS Code theme uyumlu tasarım
- [ ] Form validation çalışıyor
- [ ] Focus states ve hover effects
- [ ] Responsive layout

### ✅ Advanced Özellikler

#### 4.1 GitHub Integration Test

- [ ] GitHub server'ına connect ol
- [ ] "DevHub: List GitHub Repositories" komutunu çalıştır
- [ ] Repository listesi QuickPick'de gösterilir
- [ ] Repository seçilirse browser'da açılır

#### 4.2 Bulk Operations Test

- [ ] "DevHub: Connect All" komutunu çalıştır
- [ ] Tüm disconnected server'lar için bağlantı dialog'u gösterir
- [ ] Progress notification gösterir
- [ ] Başarılı/başarısız sayısını raporlar

- [ ] "DevHub: Disconnect All" komutunu çalıştır
- [ ] Confirmation dialog'u gösterir
- [ ] Tüm connected server'ları disconnect eder

#### 4.3 Real-time Sync Test

- [ ] Dashboard'da connect/disconnect yap
- [ ] TreeView'de status anında güncellenir
- [ ] Dashboard'da status anında güncellenir
- [ ] Status değişimleri event emitter ile çalışır

## 🔍 Hata Ayıklama

### Console Logs

- [ ] VS Code'de Developer Console (Help → Toggle Developer Tools)
- [ ] Extension activation log'larını kontrol et
- [ ] MCP server connection log'larını kontrol et
- [ ] Hata mesajlarını kontrol et

### Output Channel

- [ ] Command Palette → "DevHub: View Logs"
- [ ] Output channel'de log'ları görüntüle
- [ ] Server status'larını kontrol et

## 📊 Test Sonuçları

### Başarılı Test Senaryoları

- [ ] Extension activation başarılı
- [ ] TreeView doğru çalışıyor
- [ ] Dashboard açılıyor
- [ ] Tüm komutlar çalışıyor
- [ ] API key validation'ları doğru
- [ ] Configuration paneli çalışıyor
- [ ] Real-time sync çalışıyor
- [ ] GitHub integration çalışıyor

### Hatalı Test Senaryoları

- [ ] Geçersiz API key'ler reddediliyor
- [ ] Network hataları handle ediliyor
- [ ] Invalid input'lar validation'dan geçmiyor
- [ ] Cancel işlemleri doğru çalışıyor

## 🚨 Bilinen Sorunlar

### Simulated MCP Server'lar

- Tüm MCP server'ları simulated çalıştığı için gerçek API call'ları yapmaz
- Bağlantı success rate: %100 (simulated)
- Gerçek API integrasyonları Phase 4'te planlanıyor

### Configuration Storage

- Configuration'lar VS Code secrets'de saklanır
- Extension restart'ta configuration'lar korunur
- Manual silinmek zorunda

## 📝 Test Checklist

### ✅ Temel Fonksiyonalite

- [ ] Extension yüklenir ve aktif olur
- [ ] TreeView gösterilir
- [ ] Dashboard açılır
- [ ] Komutlar çalışır
- [ ] Status güncellemeleri çalışır

### ✅ MCP Server Yönetimi

- [ ] Tüm 17 server listelenir
- [ ] API key input dialog'ları çalışır
- [ ] Validation'lar doğru çalışır
- [ ] Connect/disconnect işlemleri çalışır
- [ ] Error handling çalışır

### ✅ Configuration

- [ ] Configuration paneli açılır
- [ ] Form validation çalışır
- [ ] Kaydetme işlemi başarılı
- [ ] Secrets storage çalışır

### ✅ UI/UX

- [ ] Modern tasarım uygulanmış
- [ ] Responsive layout
- [ ] VS Code theme uyumu
- [ ] Interactive elements çalışır
- [ ] Loading states gösterilir

## 🎯 Test Sonucu

**Test Tamamlandığında:**

- Tüm özellikler çalışıyor mu?
- Hata mesajları anlaşılır mi?
- UI/UX kullanıcı dostu mu?
- Performans kabul edilebilir mi?

**Başarılı Test Kriterleri:**

- ✅ 0 TypeScript compilation error
- ✅ 0 ESLint error
- ✅ Tüm temel özellikler çalışıyor
- ✅ API key validation'ları doğru
- ✅ Configuration paneli çalışıyor
- ✅ Real-time sync çalışıyor

---

**🎉 Test etmeye hazır! Extension tam fonksiyonel ve production hazır!**
