---
title: "Classifying Colon Pathology Images (PathMNIST) with a ResNet-Inspired CNN"
date: "2025-05-10"
description: "Fixing severe generalization failure on PathMNIST histology images, taking test accuracy from 57.7% to 82.6%."
tags:
  ["Machine Learning", "Computer Vision", "Deep Learning", "CSULB", "CECS 553"]
draft: false
links:
  - label: "Final project report"
    url: "https://drive.google.com/file/d/1vzqENtBhAs2OU20V40UsyOZnV_622zIz/view?usp=sharing"
  - label: "CECS 553: Machine Vision"
    url: "https://csulb.catalog.acalog.com/preview_course_nopop.php?catoid=11&coid=100543"
---

For my CECS 553 (Machine Vision) final project, I trained a convolutional neural network to classify colorectal cancer histology patches. The dataset was PathMNIST, a 28x28 pixel collection from MedMNIST v2 based on NCT-CRC-HE-100K. It groups tissue crops into nine classes: adipose, background, debris, lymphocytes, mucus, smooth muscle, normal colon mucosa, cancer-associated stroma, and colorectal adenocarcinoma epithelium.

Reviewing these slides manually takes time and varies across pathologists. A model that tags patches accurately could help flag regions for review.

## The model

I built a small ResNet-style CNN in Keras: stacked 3x3 convolutions with residual skips, batch normalization before each ReLU, and a classification head using global average pooling, dropout, and softmax.

The initial baseline used Adam with a 0.001 learning rate, batch size 128, and a 20-epoch cap with early stopping. Augmentation was minimal (slight rotation, zoom, translation, and contrast adjustments). Callbacks tracked validation loss for checkpointing and learning rate drops.

## It overfit

The training run looked clean, but the test numbers were terrible:

| Split      | Accuracy | AUC   | Loss |
| ---------- | -------- | ----- | ---- |
| Training   | 94.6%    | 99.7% | 0.16 |
| Validation | 70.1%    | 93.6% | 1.10 |
| Test       | 57.7%    | 82.2% | 2.86 |

A 40-point drop between training and test is not something you fix by tweaking a learning rate. PathMNIST splits training and validation images from one hospital, while the test images come from a different clinical center. The network had learned something specific to the source it trained on, and it did not transfer to the images from the other center.

## What I changed

- Pushed dropout in the dense head from 0.5 to 0.7. Going past 0.7 stopped helping.
- Added an L2 weight penalty (lambda = 5e-5) on the conv layers to constrain large weights that dropout never sees.
- Set label smoothing to 0.1 so the loss does not reward overconfident outputs.
- Added random horizontal flips and heavier rotation. Pathology crops do not have an upside down, so aggressive flipping is essentially free data.
- Dropped the learning rate to 0.0005, halved batch size from 128 to 64 to add gradient noise, and bumped early stopping patience to 15 with a 50-epoch ceiling. The baseline run had stopped early at epoch 8.

## Results

Test accuracy went from 57.7% to 82.58%, test AUC moved from 82.2% to 96.8%, and test loss dropped from 2.86 to 0.73.

Class performance split sharply. Background and lymphocytes hit 1.00 recall. Cancer-associated stroma was the hardest to classify, sitting at 0.28 F1 and dumping most of its false negatives into debris and smooth muscle. That class had the smallest sample count in the dataset, so the bottleneck was class imbalance rather than the network itself.

## What I did not solve

A 13-point gap remains between validation (95.9%) and test (82.6%). Pushing regularization and augmentation further eventually degraded training performance. I also stayed below the ~90% test accuracy benchmarked by stronger models on PathMNIST.

The obvious next steps are transfer learning from a pretrained backbone like MobileNet, rebalancing classes through weights or oversampling, and running a proper sweep with Keras Tuner or Optuna.

The project report linked above contains the full confusion matrix and per-class precision and recall numbers.
