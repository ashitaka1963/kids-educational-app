// Web Speech API による日本語音声ガイダンス
// 文字が読めない3歳児のために、お題や褒め言葉をわかりやすく優しく発話します

class SpeechManager {
  private isMuted: boolean = false;
  private currentVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoice();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
    }
  }

  private initVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // 日本語の自然な声を探す
    const jaVoice = voices.find(v => v.lang.startsWith('ja') && (v.name.includes('Google') || v.name.includes('Kyoko') || v.name.includes('Otoya') || v.name.includes('Nanami') || v.name.includes('Ayumi'))) 
      || voices.find(v => v.lang.startsWith('ja'));
    if (jaVoice) {
      this.currentVoice = jaVoice;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(text: string) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // 連続発話防止

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    // 3歳児向けに少し高め・少しゆっくりで親しみやすいトーン
    utterance.pitch = 1.25;
    utterance.rate = 0.95;

    if (this.currentVoice) {
      utterance.voice = this.currentVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechManager = new SpeechManager();
