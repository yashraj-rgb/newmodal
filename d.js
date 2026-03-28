 const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // - - - PLAYER PHYSICS - - -
        const player = {
            x: 1450, y: -320, vx: 0, vy: 0, angle: -Math.PI / 2, 
            thrust: 0.8, // Faster acceleration
            friction: 0.92, // Much smoother drifting, no sudden jamming
            maxSpeed: 15
        };

        const keys = { w: false, a: false, s: false, d: false, shift: false, space: false };

        window.addEventListener('keydown', (e) => {
            if(e.key === 'w' || e.key === 'ArrowUp') keys.w = true;
            if(e.key === 's' || e.key === 'ArrowDown') keys.s = true; // S KEY ASSIGNED!
            if(e.key === 'a' || e.key === 'ArrowLeft') keys.a = true;
            if(e.key === 'd' || e.key === 'ArrowRight') keys.d = true;
            if(e.key === 'Shift') keys.shift = true;
            if(e.key === ' ') keys.space = true; // SPACE for brakes
        });
        window.addEventListener('keyup', (e) => {
            if(e.key === 'w' || e.key === 'ArrowUp') keys.w = false;
            if(e.key === 's' || e.key === 'ArrowDown') keys.s = false;
            if(e.key === 'a' || e.key === 'ArrowLeft') keys.a = false;
            if(e.key === 'd' || e.key === 'ArrowRight') keys.d = false;
            if(e.key === 'Shift') keys.shift = false;
            if(e.key === ' ') keys.space = false;
        });

        // --- EASTER EGGS (Actual glowing eggs with codes) ---
        const eggs = [
            { id: 'calc', x: 82, y: -82, name: 'Calculator', code: '50N1C', color: '#cbd5e1', found: false },
            { id: 'rank1', x: 1, y: 1, name: 'Rank 1', code: 'RANK1', color: '#facc15', found: false },
            { id: 'sonic', x: 50, y: 100, name: 'SonicStack', code: 'H1RE_M3', color: '#a855f7', found: false },
            { id: 'troll', x: 404, y: 404, name: 'Sem 1 Result', code: 'R3SULT_N0T_F0UND_💔', color: '#ef4444', found: false },
            { id: 'troll', x: 589, y: 356, name: 'Yash ka khas', code: 'yash ke hire', color: '#44efec', found: false }

        ];

        // Stars Background
        const stars = Array.from({ length: 800 }, () => ({
            x: Math.random() * 5000 - 2500,
            y: Math.random() * 5000 - 2500,
            size: Math.random() * 2
        }));

        function updatePlayer() {
            // Rotation
            if (keys.a) player.angle -= 0.08;
            if (keys.d) player.angle += 0.08;

            // Forward Thrust (W)
            let currentThrust = keys.shift ? player.thrust * 2.5 : player.thrust;
            if (keys.w) {
                player.vx += Math.cos(player.angle) * currentThrust;
                player.vy += Math.sin(player.angle) * currentThrust;
            }

            // Reverse Thrust (S) - FIXES THE JAMMING!
            if (keys.s) {
                player.vx -= Math.cos(player.angle) * (player.thrust * 0.5);
                player.vy -= Math.sin(player.angle) * (player.thrust * 0.5);
            }

            // Brakes (Spacebar)
            if (keys.space) {
                player.vx *= 0.85;
                player.vy *= 0.85;
            }

            // Check Egg Collisions
            eggs.forEach(egg => {
                if (!egg.found) {
                    let dx = egg.x - player.x;
                    let dy = egg.y - player.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    
                    // Light magnetic pull to help player catch it
                    if (dist < 120 && dist > 20) {
                        player.vx += (dx / dist) * 0.15;
                        player.vy += (dy / dist) * 0.15;
                    }

                    // Collect the egg!
                    if (dist < 40) {
                        egg.found = true;
                        updateInventoryHUD(); // Add code to UI
                    }
                }
            });

            // Apply Friction
            player.vx *= player.friction;
            player.vy *= player.friction;

            // Speed Limit
            const speed = Math.sqrt(player.vx ** 2 + player.vy ** 2);
            if (speed > player.maxSpeed) {
                player.vx = (player.vx / speed) * player.maxSpeed;
                player.vy = (player.vy / speed) * player.maxSpeed;
            }

            // Move
            player.x += player.vx;
            player.y += player.vy;
        }

        function drawScene() {
            ctx.fillStyle = "#070a14";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const offsetX = canvas.width / 2 - player.x;
            const offsetY = canvas.height / 2 - player.y;

            // Draw Stars
            ctx.fillStyle = "#ffffff";
            stars.forEach(star => {
                let stretch = keys.shift && keys.w ? 8 : 1; 
                ctx.beginPath();
                ctx.arc(star.x + offsetX * 0.5, star.y + offsetY * 0.5, star.size, 0, Math.PI * 2);
                ctx.fill();
                
                if(stretch > 1) {
                    ctx.strokeStyle = "rgba(255,255,255,0.3)";
                    ctx.beginPath();
                    ctx.moveTo(star.x + offsetX * 0.5, star.y + offsetY * 0.5);
                    ctx.lineTo((star.x + offsetX * 0.5) - player.vx * stretch, (star.y + offsetY * 0.5) - player.vy * stretch);
                    ctx.stroke();
                }
            });

            // Draw Eggs (Anomalies)
            eggs.forEach(egg => {
                let drawX = egg.x + offsetX;
                let drawY = egg.y + offsetY;

                if (!egg.found) {
                    // Draw glowing egg shape
                    ctx.save();
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = egg.color;
                    ctx.fillStyle = egg.color;
                    ctx.beginPath();
                    ctx.ellipse(drawX, drawY, 15, 22, 0, 0, Math.PI * 2); // Egg shape
                    ctx.fill();
                    ctx.restore();
                    
                    // Draw name above egg
                    ctx.fillStyle = "rgba(255,255,255,0.7)";
                    ctx.font = "12px monospace";
                    ctx.textAlign = "center";
                    ctx.fillText(egg.name, drawX, drawY - 35);
                } else {
                    // If found, leave a glowing code floating in space
                    ctx.save();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = egg.color;
                    ctx.fillStyle = egg.color;
                    ctx.font = "bold 20px monospace";
                    ctx.textAlign = "center";
                    ctx.fillText(egg.code, drawX, drawY);
                    ctx.restore();
                }
            });

            // Draw Ship
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(player.angle);

            // Forward Thruster (W)
            if (keys.w) {
                ctx.fillStyle = keys.shift ? "#00ffff" : "#ff4500"; 
                ctx.beginPath();
                ctx.moveTo(-10, 5);
                ctx.lineTo(-25 - Math.random() * 10, 0); 
                ctx.lineTo(-10, -5);
                ctx.fill();
            }

            // Reverse Thruster (S)
            if (keys.s) {
                ctx.fillStyle = "#ff4500"; 
                ctx.beginPath();
                ctx.moveTo(15, 5);
                ctx.lineTo(25 + Math.random() * 5, 0); 
                ctx.lineTo(15, -5);
                ctx.fill();
            }

            // Ship Body
            ctx.fillStyle = "#39FF14"; 
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(-15, 15);
            ctx.lineTo(-10, 0);
            ctx.lineTo(-15,-15);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        function updateInventoryHUD() {
            const invDiv = document.getElementById('inventory');
            invDiv.innerHTML = ''; // Clear current list
            
            eggs.forEach(egg => {
                if (egg.found) {
                    invDiv.innerHTML += `<div class="code-item">${egg.name}: <span class="found-code">${egg.code}</span></div>`;
                }
            });
        }

        function updateTelemetria() {
            document.getElementById('tele-x').innerText = Math.round(player.x);
            document.getElementById('tele-y').innerText = Math.round(player.y);
        }

        function gameLoop() {
            updatePlayer();
            drawScene();
            updateTelemetria();
            requestAnimationFrame(gameLoop);
        }

        requestAnimationFrame(gameLoop);