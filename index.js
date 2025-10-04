export default({$APP:a,Model:n,T:d,html:s})=>{a.events.on("INIT_APP",async()=>{a.define("app-quick-add-buttons",{properties:{customAmount:d.string(""),isCustomOpen:d.boolean(!1)},async addPushups(t){const e=new Date().toISOString().split("T")[0];await n.sessions.add({count:t,date:e,timestamp:new Date().toISOString()})},async addCustom(){const t=Number.parseInt(this.customAmount);t>0&&(await this.addPushups(t),this.customAmount="",this.isCustomOpen=!1)},render(){return s`
                <div class="bg-white border-4 border-black rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 class="text-2xl font-black mb-6 uppercase">Add Pushups</h2>
                    
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <button 
                            @click=${()=>this.addPushups(1)}
                            class="bg-yellow-400 border-4 border-black font-black text-2xl py-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:bg-yellow-500"
                        >
                            +1
                        </button>
                        <button 
                            @click=${()=>this.addPushups(5)}
                            class="bg-pink-400 border-4 border-black font-black text-2xl py-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:bg-pink-500"
                        >
                            +5
                        </button>
                        <button 
                            @click=${()=>this.addPushups(10)}
                            class="bg-green-400 border-4 border-black font-black text-2xl py-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:bg-green-500"
                        >
                            +10
                        </button>
                    </div>

                    ${this.isCustomOpen?s`
                        <div class="bg-blue-100 border-4 border-black p-4">
                            <uix-form .submit=${this.addCustom.bind(this)}>
                                <div class="flex gap-2">
                                    <input 
                                        type="number" 
                                        .value=${this.customAmount}
                                        @input=${t=>this.customAmount=t.target.value}
                                        placeholder="Amount"
                                        class="flex-1 border-4 border-black px-4 py-2 font-bold text-xl"
                                    />
                                    <button 
                                        type="submit"
                                        class="bg-blue-400 border-4 border-black px-6 font-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        ADD
                                    </button>
                                </div>
                            </uix-form>
                        </div>
                    `:s`
                        <button 
                            @click=${()=>this.isCustomOpen=!0}
                            class="w-full bg-blue-400 border-4 border-black font-black py-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            CUSTOM AMOUNT
                        </button>
                    `}
                </div>
            `}}),a.define("app-daily-total",{getTodayTotal(){if(!this._rows)return 0;const t=new Date().toISOString().split("T")[0];return this._rows.filter(e=>e.date===t).reduce((e,o)=>e+o.count,0)},render(){if(!this._rows)return s`<uix-spinner></uix-spinner>`;const t=this.getTodayTotal();return s`
                <div class="bg-gradient-to-br from-yellow-300 to-yellow-400 border-4 border-black rounded-none p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div class="text-sm font-black uppercase mb-2">Today's Total</div>
                    <div class="text-7xl font-black mb-2">${t}</div>
                    <div class="text-xl font-black uppercase">Pushups</div>
                </div>
            `}}),a.define("app-progress-to-1k",{getLifetimeTotal(){return this._rows?this._rows.reduce((t,e)=>t+e.count,0):0},getMilestone(){const t=this.getLifetimeTotal();return t>=1e3?{next:1e3,current:1e3}:{next:1e3,current:t}},render(){if(!this._rows)return s`<uix-spinner></uix-spinner>`;const t=this.getMilestone(),e=t.current/t.next*100;return s`
                <div class="bg-white border-4 border-black rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-black uppercase">Progress to 1K</h2>
                        <div class="text-2xl font-black">${t.current} / ${t.next}</div>
                    </div>
                    
                    <div class="bg-gray-200 border-4 border-black h-16 relative overflow-hidden">
                        <div 
                            class="bg-gradient-to-r from-green-400 to-green-500 h-full border-r-4 border-black transition-all duration-500"
                            style="width: ${e}%"
                        ></div>
                        <div class="absolute inset-0 flex items-center justify-center font-black text-2xl">
                            ${Math.round(e)}%
                        </div>
                    </div>

                    ${t.current>=1e3?s`
                        <div class="mt-4 bg-yellow-300 border-4 border-black p-4 text-center">
                            <div class="text-3xl font-black">🎉 MILESTONE REACHED! 🎉</div>
                            <div class="text-lg font-bold mt-2">You hit 1000 pushups!</div>
                        </div>
                    `:""}
                </div>
            `}}),a.define("app-recent-sessions",{async deleteSession(t){confirm("Delete this session?")&&await n.sessions.remove(t)},formatTime(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})},render(){if(!this._rows)return s`<uix-spinner></uix-spinner>`;const t=[...this._rows].sort((e,o)=>new Date(o.timestamp)-new Date(e.timestamp)).slice(0,10);return s`
                <div class="bg-white border-4 border-black rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 class="text-2xl font-black mb-4 uppercase">Recent Sessions</h2>
                    
                    <div class="space-y-2">
                        ${t.length===0?s`
                            <div class="text-center text-gray-500 font-bold py-8">
                                No sessions yet. Start pushing!
                            </div>
                        `:t.map(e=>s`
                            <div class="flex justify-between items-center bg-gray-100 border-2 border-black p-3">
                                <div class="flex items-center gap-4">
                                    <div class="bg-pink-400 border-2 border-black px-4 py-2 font-black text-xl">
                                        ${e.count}
                                    </div>
                                    <div>
                                        <div class="font-bold">${e.date}</div>
                                        <div class="text-sm">${this.formatTime(e.timestamp)}</div>
                                    </div>
                                </div>
                                <button 
                                    @click=${()=>this.deleteSession(e.id)}
                                    class="bg-red-400 border-2 border-black px-3 py-2 font-black hover:bg-red-500"
                                >
                                    ✕
                                </button>
                            </div>
                        `)}
                    </div>
                </div>
            `}}),a.define("app-stats-grid",{getStats(){if(!this._rows||this._rows.length===0)return{totalPushups:0,totalSessions:0,avgPerSession:0,bestDay:0};const t=this._rows.reduce((r,p)=>r+p.count,0),e=this._rows.length,o=Math.round(t/e),i={};this._rows.forEach(r=>{i[r.date]||(i[r.date]=0),i[r.date]+=r.count});const l=Math.max(...Object.values(i),0);return{totalPushups:t,totalSessions:e,avgPerSession:o,bestDay:l}},render(){if(!this._rows)return s`<uix-spinner></uix-spinner>`;const t=this.getStats();return s`
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div class="text-4xl font-black mb-2">${t.totalPushups}</div>
                        <div class="font-black uppercase text-sm">Total Pushups</div>
                    </div>
                    <div class="bg-orange-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div class="text-4xl font-black mb-2">${t.totalSessions}</div>
                        <div class="font-black uppercase text-sm">Sessions</div>
                    </div>
                    <div class="bg-pink-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div class="text-4xl font-black mb-2">${t.avgPerSession}</div>
                        <div class="font-black uppercase text-sm">Avg/Session</div>
                    </div>
                    <div class="bg-green-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div class="text-4xl font-black mb-2">${t.bestDay}</div>
                        <div class="font-black uppercase text-sm">Best Day</div>
                    </div>
                </div>
            `}}),a.define("app-index",{render(){return s`
                <div class="min-h-screen bg-yellow-50 p-4 md:p-8">
                    <div class="max-w-4xl mx-auto space-y-6">
                        <header class="text-center mb-8">
                            <h1 class="text-6xl md:text-7xl font-black mb-4 uppercase transform -rotate-2">
                                <span class="inline-block bg-pink-400 border-4 border-black px-6 py-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    1K PUSHUPS
                                </span>
                            </h1>
                            <p class="text-xl font-bold">Track your way to 1,000 pushups! 💪</p>
                        </header>
                        <app-daily-total ._data=${{model:"sessions"}}></app-daily-total>
                        <app-quick-add-buttons></app-quick-add-buttons>
                        <app-progress-to-1k ._data=${{model:"sessions"}}></app-progress-to-1k>
                        <app-stats-grid ._data=${{model:"sessions"}}></app-stats-grid>
                        <app-recent-sessions ._data=${{model:"sessions"}}></app-recent-sessions>
                    </div>
                </div>
            `}})})};
