document.addEventListener('DOMContentLoaded', () => {
    /* -----------------------------------------------------------
       1. Cursor Glow & Global Mouse Tracking
    ----------------------------------------------------------- */
    const cursorGlow = document.getElementById('cursor-glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorGlow) {
            cursorGlow.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        }
    });

    /* -----------------------------------------------------------
       2. Magnetic / 3D Tilt Cards effect
    ----------------------------------------------------------- */
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        const wrapper = card.parentElement; // the moving-border-wrapper
        
        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            // Calculate cursor position relative to card center (-1 to 1)
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            
            // Adjust multiplier for stronger/weaker tilt
            const tiltX = y * -5;
            const tiltY = x * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        wrapper.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });

    /* -----------------------------------------------------------
       3. Interactive Particle Network Background (Canvas)
    ----------------------------------------------------------- */
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        let nodes = [];
        const maxNodes = window.innerWidth < 768 ? 40 : 80;
        const connectionDistance = 150;
        const mouseConnectionDistance = 200;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        class Node {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Dodge Mouse slightly
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 100) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                const isLight = document.body.classList.contains('light-mode');
                ctx.fillStyle = isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
                ctx.fill();
            }
        }

        for (let i = 0; i < maxNodes; i++) {
            nodes.push(new Node());
        }

        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < nodes.length; i++) {
                nodes[i].update();
                nodes[i].draw();

                // Connect to other nodes
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        
                        const alpha = 1 - (dist / connectionDistance);
                        const isLight = document.body.classList.contains('light-mode');
                        ctx.strokeStyle = isLight ? `rgba(0,0,0,${alpha * 0.15})` : `rgba(255,255,255,${alpha * 0.15})`;
                        ctx.stroke();
                    }
                }

                // Connect to mouse
                const mouseDx = nodes[i].x - mouseX;
                const mouseDy = nodes[i].y - mouseY;
                const mouseDist = Math.sqrt(mouseDx*mouseDx + mouseDy*mouseDy);

                if (mouseDist < mouseConnectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(mouseX, mouseY);
                    
                    const alpha = 1 - (mouseDist / mouseConnectionDistance);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.5})`; // Blue accent connect
                    ctx.stroke();
                }
            }

            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    /* -----------------------------------------------------------
       4. Sticky Navbar & Scroll Logic
    ----------------------------------------------------------- */
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    /* -----------------------------------------------------------
       5. Typing Animation (Terminal Style)
    ----------------------------------------------------------- */
    const typedTextSpan = document.querySelector(".typed-text");
    const textArray = ["Software_Developer", "Machine_Learning", "Data_Engineer", "Problem_Solver"];
    const typingDelay = 100;
    const erasingDelay = 50;
    const newTextDelay = 2000;
    let textArrayIndex = 0;
    let charIndex = 0;

    function type() {
        if (!typedTextSpan) return;
        if (charIndex < textArray[textArrayIndex].length) {
            typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingDelay);
        } else {
            setTimeout(erase, newTextDelay);
        }
    }

    function erase() {
        if (!typedTextSpan) return;
        if (charIndex > 0) {
            typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingDelay);
        } else {
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, typingDelay + 1100);
        }
    }

    if (textArray.length && typedTextSpan) setTimeout(type, newTextDelay + 250);

    /* -----------------------------------------------------------
       6. Intersection Observer for Scroll Animations
    ----------------------------------------------------------- */
    const animateElements = document.querySelectorAll('[data-animate]');
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        });
    }, observerOptions);

    animateElements.forEach(element => appearOnScroll.observe(element));

    /* -----------------------------------------------------------
       7. Project Filtering
    ----------------------------------------------------------- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectWrappers = document.querySelectorAll('.project-wrapper');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectWrappers.forEach(wrapper => {
                const category = wrapper.getAttribute('data-category');
                wrapper.style.display = 'none';
                wrapper.classList.remove('animate-in');
                
                if (filterValue === 'all' || category.includes(filterValue)) {
                    wrapper.style.display = 'block';
                    // Trigger reflow
                    void wrapper.offsetWidth;
                    wrapper.classList.add('animate-in');
                }
            });
        });
    });

    /* -----------------------------------------------------------
       8. Theme Toggle & Mobile Menu
    ----------------------------------------------------------- */
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const themeIcon = themeBtn.querySelector('i');
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            if (document.body.classList.contains('light-mode')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
    }

    // if (contactForm) {
    //     contactForm.addEventListener('submit', async (e) => {
    //         e.preventDefault();
    //         const btn = contactForm.querySelector('button[type="submit"]');
    //         const originalText = btn.innerHTML;
            
    //         // Get form data
    //         const formData = new FormData(contactForm);
            
    //         btn.innerHTML = 'Establishing_SSL... <i class="fa-solid fa-spinner fa-spin"></i>';
    //         btn.classList.add('disabled');
            
    //         try {
    //             // Sending to Formspree - user needs to replace 'mqaejvda' with their own ID or I will provide instructions
    //             const response = await fetch('https://formspree.io/f/mqaejvda', {
    //                 method: 'POST',
    //                 body: formData,
    //                 headers: {
    //                     'Accept': 'application/json'
    //                 }
    //             });
                
    //             if (response.ok) {
    //                 btn.innerHTML = 'Return Code: 200 (Delivered) <i class="fa-solid fa-check"></i>';
    //                 btn.style.background = '#10b981';
    //                 contactForm.reset();
    //             } else {
    //                 btn.innerHTML = 'Error: Link_Failure <i class="fa-solid fa-circle-exclamation"></i>';
    //                 btn.style.background = '#ef4444';
    //             }
    //         } catch (error) {
    //             btn.innerHTML = 'Critical_Error: 500 <i class="fa-solid fa-circle-exclamation"></i>';
    //             btn.style.background = '#ef4444';
    //         } finally {
    //             setTimeout(() => {
    //                 btn.innerHTML = originalText;
    //                 btn.style.background = '';
    //                 btn.classList.remove('disabled');
    //             }, 4000);
    //         }
    //     });
    // }
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = 'Establishing_SSL... <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.classList.add('disabled');

            emailjs.sendForm(
                "service_dkqm66d",   // 🔁 replace
                "template_2vtg09q",  // 🔁 replace
                contactForm
            )
            .then(() => {
                btn.innerHTML = 'Return Code: 200 (Delivered) <i class="fa-solid fa-check"></i>';
                btn.style.background = '#10b981';
                contactForm.reset();
            })
            .catch((error) => {
                console.error(error);
                btn.innerHTML = 'Critical_Error: 500 <i class="fa-solid fa-circle-exclamation"></i>';
                btn.style.background = '#ef4444';
            })
            .finally(() => {
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.classList.remove('disabled');
                }, 4000);
            });
        });
    }
});

//// to send msg use EmailJs
