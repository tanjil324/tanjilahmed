(()=>{
 const form=document.getElementById('hire-form'),service=document.getElementById('hire-service');
 document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{service.value=link.dataset.service;}));
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const data=new FormData(form),name=data.get('name').trim(),message=data.get('message').trim();
  if(!name||!message){document.getElementById('hire-status').textContent='Please enter your name and a short project description.';return;}
  const subject='Project enquiry: '+data.get('service');
  const body=`Hi Shifat,\n\n${message}\n\nService: ${data.get('service')}\nName: ${name}\nEmail: ${data.get('email')}\n`;
  window.location.href='mailto:tanjilahmed46324@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  document.getElementById('hire-status').textContent='Your email draft is ready to open. If no email app opens, email me directly using the address beside this form.';
 });
})();
