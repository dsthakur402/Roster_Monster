import torch
from transformers import AutoModelForCausalLM

from deepseek_vl2.models import DeepseekVLV2Processor, DeepseekVLV2ForCausalLM
from deepseek_vl2.utils.io import load_pil_images


# specify the path to the model
model_path = "deepseek-ai/deepseek-vl2-tiny"
vl_chat_processor: DeepseekVLV2Processor = DeepseekVLV2Processor.from_pretrained(model_path)
tokenizer = vl_chat_processor.tokenizer

vl_gpt: DeepseekVLV2ForCausalLM = AutoModelForCausalLM.from_pretrained(model_path, trust_remote_code=True)
vl_gpt = vl_gpt.to(torch.bfloat16).cuda().eval()
template = "<h2>EXAM:</h2> THYROID ULTRASOUND<h2>HISTORY:</h2><h2>TECHNIQUE:</h2><p>The thyroid gland was interrogated with a high-frequency linear transducer, employing grayscale imaging, duplex Doppler and color flow Doppler imaging.</p><h2>COMPARISON:</h2><p>None available.</p><h2>FINDINGS:</h2> <p>The thyroid gland is normal in size; the right lobe measures approximately _ cm; the left lobe measures approximately _ cm; and the isthmus measures approximately _ mm thick.<br>There is no suspicious thyroid mass lesions seen. No perithyroid fluid collection is noted. The partially imaged carotid arteries and jugular veins appear grossly unremarkable.</p><h2>IMPRESSION:</h2><p>1.   Unremarkable thyroid gland ultrasound as described above.</p><h2>RECOMMENDATIONS:</h2>"
## single image conversation example
conversation = [
    {
        "role": "<|User|>",
        "content": "<image>This image has Ultrasound measurements. Extract all of them and put in a JSON.",
        "images": ["image.jpg"],
    },
    {"role": "<|Assistant|>", "content": ""},
]

## multiple images (or in-context learning) conversation example
# conversation = [
#     {
#         "role": "User",
#         "content": "<image_placeholder>A dog wearing nothing in the foreground, "
#                    "<image_placeholder>a dog wearing a santa hat, "
#                    "<image_placeholder>a dog wearing a wizard outfit, and "
#                    "<image_placeholder>what's the dog wearing?",
#         "images": [
#             "images/dog_a.png",
#             "images/dog_b.png",
#             "images/dog_c.png",
#             "images/dog_d.png",
#         ],
#     },
#     {"role": "Assistant", "content": ""}
# ]

# load images and prepare for inputs
pil_images = load_pil_images(conversation)
prepare_inputs = vl_chat_processor.__call__(
    conversations=conversation,
    images=pil_images,
    force_batchify=True,
    system_prompt=""
).to(vl_gpt.device)
with torch.no_grad():
    # run image encoder to get the image embeddings
    inputs_embeds = vl_gpt.prepare_inputs_embeds(**prepare_inputs)
    past_key_values = None
    # run the model to get the response
    outputs = vl_gpt.generate(
             # inputs_embeds=inputs_embeds[:, -1:],
            # input_ids=prepare_inputs.input_ids[:, -1:],
            inputs_embeds=inputs_embeds,
            input_ids=prepare_inputs.input_ids,
            images=prepare_inputs.images,
            images_seq_mask=prepare_inputs.images_seq_mask,
            images_spatial_crop=prepare_inputs.images_spatial_crop,
            attention_mask=prepare_inputs.attention_mask,
            past_key_values=past_key_values,

            pad_token_id=tokenizer.eos_token_id,
            bos_token_id=tokenizer.bos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            max_new_tokens=512,

            # do_sample=False,
            # repetition_penalty=1.1,

            do_sample=True,
            temperature=0.4,
            top_p=0.9,
            repetition_penalty=1.1,

            use_cache=True,
    )

    answer = tokenizer.decode(outputs[0].cpu().tolist(), skip_special_tokens=True)
    print(f"{prepare_inputs['sft_format'][0]}", answer)
